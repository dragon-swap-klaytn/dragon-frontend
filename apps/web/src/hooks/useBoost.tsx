import { CAKE } from '@pancakeswap/tokens'
import { useModal, useToast } from '@pancakeswap/uikit'
import { MasterChefV3, NonfungiblePositionManager } from '@pancakeswap/v3-sdk'
import ApprovalConfirmationModal from 'components/ApprovalConfirmationModal'
import { ToastDescriptionWithTx } from 'components/Toast'
import { MASTERCHEFV3_ADDRESS, V3_NFT_POSITION_MANAGER_ADDRESS } from 'const'
import { useActiveChainId } from 'hooks/useActiveChainId'
import useCatchTxError from 'hooks/useCatchTxError'
import useKlipQrCondition from 'hooks/useKlipQrCondition'
import usePortfolio, { PortfolioV3DataBigInt } from 'hooks/usePortfolio'
import { useUnwrapRewardV2 } from 'hooks/useUnwrapRewardV2'
import { useTranslation } from 'next-i18next'
import { useCallback, useMemo } from 'react'
import { calculateGasMargin } from 'utils'
import { viemClients } from 'utils/viem'
import { Address, hexToBigInt } from 'viem'
import { useAccount, useQueryClient, useSendTransaction, useWalletClient } from 'wagmi'

export default function useBoost({
  poolId,
  positionId,
  onDone,
}: {
  poolId: Address
  positionId: number
  onDone?: () => void
}) {
  const { t } = useTranslation()
  const { address: account } = useAccount()
  const { data: signer } = useWalletClient()
  const { loading, setLoading, fetchWithCatchTxError } = useCatchTxError()
  const { sendTransactionAsync } = useSendTransaction()
  const { toastSuccess } = useToast()
  const { chainId } = useActiveChainId()
  const publicClient = viemClients[chainId as keyof typeof viemClients]

  const handleDismissConfirmation = useCallback(() => {
    setLoading(false)
  }, [setLoading])

  const [onPresentKlipTxModal, onDismissKlipTxModal] = useModal(
    <ApprovalConfirmationModal
      title={t('Confirm Transaction')}
      content={() => ''}
      pendingText={t('wating confirm...')}
      attemptingTxn={loading}
      customOnDismiss={handleDismissConfirmation}
    />,
    true,
    true,
    `TxConfirmationModal:useBoost:${poolId}:${positionId}`,
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

    if (showKlipQrCode) {
      onDismissKlipTxModal({ force: true })
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
    onDismissKlipTxModal,
    showKlipQrCode,
    onDone,
  ])

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

  const rewardToken = CAKE[chainId]
  const { onAlert } = useUnwrapRewardV2({
    rewardToken,
    modalKey: 'useBoost',
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
      if (rewardAmount > 0) {
        await onAlert(rewardAmount)
      } else {
        toastSuccess(`${t('Boost Canceled')}!`, <ToastDescriptionWithTx txHash={resp.transactionHash} />)
      }

      onDone?.()
    }

    if (showKlipQrCode) {
      onDismissKlipTxModal({ force: true })
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
    showKlipQrCode,
    onPresentKlipTxModal,
    onDismissKlipTxModal,
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

    if (showKlipQrCode) {
      onPresentKlipTxModal()
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

    if (showKlipQrCode) {
      onDismissKlipTxModal({ force: true })
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
    showKlipQrCode,
    onPresentKlipTxModal,
    onDismissKlipTxModal,
  ])

  return {
    onStake,
    onUnstake,
    onHarvest,
    attemptingTxn: loading,
  }
}
