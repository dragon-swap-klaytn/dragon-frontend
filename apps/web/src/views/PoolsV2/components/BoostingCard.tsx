import { CAKE } from '@pancakeswap/tokens'
import { ButtonV2, useModal, useToast } from '@pancakeswap/uikit'
import { MasterChefV3, NonfungiblePositionManager } from '@pancakeswap/v3-sdk'
import { useQueryClient } from '@tanstack/react-query'
import clsx from 'clsx'
import ApprovalConfirmationModal from 'components/ApprovalConfirmationModal'
import { ToastDescriptionWithTx } from 'components/Toast'
import { MASTERCHEFV3_ADDRESS, V3_NFT_POSITION_MANAGER_ADDRESS } from 'const'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { useCakePrice } from 'hooks/useCakePrice'
import useCatchTxError from 'hooks/useCatchTxError'
import useKlipQrCondition from 'hooks/useKlipQrCondition'
import usePortfolio, { PortfolioV3DataBigInt } from 'hooks/usePortfolio'
import { useUnwrapRewardV2 } from 'hooks/useUnwrapRewardV2'
import { useTranslation } from 'next-i18next'
import { useCallback, useMemo } from 'react'
import { calculateGasMargin } from 'utils'
import { formatAmount } from 'utils/formatInfoNumbers'
import { viemClients } from 'utils/viem'
import { Address, hexToBigInt } from 'viem'
import { useAccount, useSendTransaction, useWalletClient } from 'wagmi'

export default function BoostingCard({
  className,
  poolId,
  positionId,
  isStaked,
  onDone,
}: {
  className?: string
  poolId: Address
  positionId: number
  isStaked: boolean
  onDone?: () => void
}) {
  const { t } = useTranslation()
  const { address: account } = useAccount()
  const { data: signer } = useWalletClient()
  const { chainId } = useActiveChainId()
  const publicClient = viemClients[chainId as keyof typeof viemClients]
  const { loading, setLoading, fetchWithCatchTxError } = useCatchTxError()
  const { sendTransactionAsync } = useSendTransaction()
  const { toastSuccess } = useToast()
  const { portfolio } = usePortfolio({ account, onlyPoolIds: [poolId] })
  const positionData = useMemo(() => {
    if (!portfolio || !portfolio[poolId]) return null

    const position = (portfolio[poolId] as PortfolioV3DataBigInt).positions.find((p) => p.positionId === positionId)
    if (!position) return null
    return position
  }, [portfolio, poolId, positionId])

  const rewardAmount = useMemo(() => {
    if (!positionData || !positionData.rewards) return 0
    return positionData.rewards.reduce((acc, r) => acc + r.amount, 0)
  }, [positionData])

  const handleDismissConfirmation = useCallback(() => {
    setLoading(false)
  }, [setLoading])

  const [onPresentKlipTxModal, onDismissKlipTxModal] = useModal(
    <ApprovalConfirmationModal
      title={t('Confirm Transaction')}
      content={() => ''}
      pendingText={t('wating confirm...')}
      attemptingTxn
      customOnDismiss={handleDismissConfirmation}
    />,
    true,
    true,
    'TxConfirmationModal',
  )
  const showKlipQrCode = useKlipQrCondition()
  const onStake = useCallback(async () => {
    if (!account) return

    const { calldata, value } = NonfungiblePositionManager.safeTransferFromParameters({
      tokenId: positionId,
      recipient: MASTERCHEFV3_ADDRESS,
      sender: account,
    })

    const txn = {
      to: V3_NFT_POSITION_MANAGER_ADDRESS,
      data: calldata,
      value: hexToBigInt(value),
      account,
      chain: signer?.chain,
    }

    if (showKlipQrCode) {
      onPresentKlipTxModal()
    }

    const resp = await fetchWithCatchTxError(() =>
      publicClient.estimateGas(txn).then((estimate) => {
        const newTxn = {
          ...txn,
          gas: calculateGasMargin(estimate),
        }

        return sendTransactionAsync(newTxn)
      }),
    )

    if (resp?.status) {
      toastSuccess(`${t('Boost Completed')}!`, <ToastDescriptionWithTx txHash={resp.transactionHash} />)

      onDone?.()
    }
  }, [
    account,
    fetchWithCatchTxError,
    publicClient,
    sendTransactionAsync,
    signer,
    t,
    toastSuccess,
    positionId,
    onPresentKlipTxModal,
    showKlipQrCode,
    onDone,
  ])

  const cakePrice = useCakePrice()
  const rewardToken = CAKE[chainId]

  const { onAlert } = useUnwrapRewardV2({
    rewardToken,
  })

  const onUnstake = useCallback(async () => {
    if (!account) return
    const { calldata, value } = MasterChefV3.withdrawCallParameters({ tokenId: positionId, to: account })

    const txn = {
      account,
      to: MASTERCHEFV3_ADDRESS,
      data: calldata,
      value: hexToBigInt(value),
      chain: signer?.chain,
    }

    const resp = await fetchWithCatchTxError(() =>
      publicClient.estimateGas(txn).then((estimate) => {
        const newTxn = {
          ...txn,
          gas: calculateGasMargin(estimate),
        }

        return sendTransactionAsync(newTxn)
      }),
    )
    if (resp?.status) {
      if (rewardAmount > 0) {
        await onAlert(rewardAmount)
      } else {
        toastSuccess(`${t('Boost Canceled')}!`, <ToastDescriptionWithTx txHash={resp.transactionHash} />)
      }

      onDone?.()
    }
  }, [
    account,
    fetchWithCatchTxError,
    publicClient,
    sendTransactionAsync,
    signer,
    t,
    toastSuccess,
    positionId,
    rewardAmount,
    onDone,
    onAlert,
  ])

  const queryClient = useQueryClient()
  const onHarvest = useCallback(async () => {
    if (!account) return
    const { calldata } = MasterChefV3.harvestCallParameters({ tokenId: positionId, to: account })

    const txn = {
      to: MASTERCHEFV3_ADDRESS,
      data: calldata,
      value: 0n,
    }

    const resp = await fetchWithCatchTxError(() =>
      publicClient
        .estimateGas({
          account,
          ...txn,
        })
        .then((estimate) => {
          const newTxn = {
            ...txn,
            account,
            chain: signer?.chain,
            gas: calculateGasMargin(estimate),
          }

          return sendTransactionAsync(newTxn)
        }),
    )

    if (resp?.status) {
      if (rewardAmount) {
        await onAlert(rewardAmount)
      } else {
        toastSuccess(`${t('Harvested')}!`, <ToastDescriptionWithTx txHash={resp.transactionHash} />)
      }

      queryClient.invalidateQueries({ queryKey: ['mcv3-harvest'] })

      onDone?.()
    }
  }, [
    account,
    fetchWithCatchTxError,
    publicClient,
    sendTransactionAsync,
    signer,
    t,
    toastSuccess,
    queryClient,
    onDone,
    positionId,
    rewardAmount,
    onAlert,
  ])

  const handleHarvest = useCallback(async () => {
    if (showKlipQrCode) {
      onPresentKlipTxModal()
    }

    await onHarvest()

    if (showKlipQrCode) {
      onDismissKlipTxModal({ force: true })
    }
  }, [onPresentKlipTxModal, onDismissKlipTxModal, showKlipQrCode, onHarvest])

  return (
    <div className={clsx('px-4 py-3 rounded-xl bg-neutral w-full', className)}>
      <div className="flex items-center space-x-3 justify-between">
        {!isStaked ? (
          <>
            <div className="flex flex-col">
              <h4 className="text-on-surface">{t('Deposit tokens and harvest rewards!')}</h4>

              <p className="text-xs text-on-surface-subtlest mt-2">
                {t('Provide tokens to the liquidity pool to start farming.')}
              </p>
              <p className="text-xs text-on-surface-subtlest">
                {t(
                  'Rewards accumulate daily based on your deposit amount, and you can claim them to your wallet anytime.',
                )}
              </p>
            </div>

            <ButtonV2 variant="primary" onClick={onStake} disabled={loading}>
              {t('Start Boost')}
            </ButtonV2>
          </>
        ) : (
          <>
            <div className="flex flex-col space-y-2 items-start">
              <h5 className="text-on-surface-subtlest text-xs">{t('Harvested Amount')}</h5>

              <span className="text-on-surface font-bold">{`${rewardAmount} ${rewardToken.symbol}`}</span>

              <span className="text-on-surface-subtlest text-xs">
                ~ {formatAmount(rewardAmount * cakePrice.toNumber())} USD
              </span>
            </div>

            <div className="flex items-center space-x-3">
              <ButtonV2 variant="subtle" onClick={onUnstake} disabled={loading}>
                {t('Cancel Boost')}
              </ButtonV2>

              <ButtonV2 variant="secondary" onClick={handleHarvest} disabled={loading || !rewardAmount}>
                {t('Harvest')}
              </ButtonV2>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
