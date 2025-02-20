import { useTranslation } from '@pancakeswap/localization'
import { ChainId, ERC20Token } from '@pancakeswap/sdk'
import { CAKE } from '@pancakeswap/tokens'
import { ButtonV2, CurrencyLogoWithAmount, useModal, useToast } from '@pancakeswap/uikit'
import {
  CollectToOptions,
  CollectV2Options,
  HarvestOptions,
  MasterChefV3,
  NonfungiblePositionManager,
} from '@pancakeswap/v3-sdk'
import { ConfirmationModalContent } from '@pancakeswap/widgets-internal'
import clsx from 'clsx'
import { ToastDescriptionWithTx } from 'components/Toast'
import TransactionConfirmationModal from 'components/TransactionConfirmationModal'
import { MASTERCHEFV3_ADDRESS } from 'const'
import { useTokenMap } from 'hooks/Tokens'
import { Portfolio, PortfolioV3DataBigInt } from 'hooks/use-portfolio'
import useCatchTxError from 'hooks/useCatchTxError'
import { useV3NFTPositionManagerContract } from 'hooks/useContract'
import { useUnwrapRewardV2 } from 'hooks/useUnwrapRewardV2'
import { useCallback, useMemo, useState } from 'react'
import { calculateGasMargin } from 'utils'
import { formatAmount } from 'utils/formatInfoNumbers'
import { isUserRejected } from 'utils/sentry'
import { transactionErrorToUserReadableMessage } from 'utils/transactionErrorToUserReadableMessage'
import { getViemClients } from 'utils/viem'
import { Address, hexToBigInt } from 'viem'
import { formatDollarAmountV2 } from 'views/Dashboard/utils/numbers'
import { useAccount, useSendTransaction, useWalletClient } from 'wagmi'
import { SendTransactionResult } from 'wagmi/actions'

const chainId = ChainId.KLAYTN

type UseClaimFeesAndRewardsProps = {
  priceMap: Record<string, number>
  portfolio?: Portfolio
  invalidatePortflio?: () => void
}

export default function useClaimFeesAndRewards({
  priceMap,
  portfolio,
  invalidatePortflio,
}: UseClaimFeesAndRewardsProps) {
  const { t } = useTranslation()

  const { address: account } = useAccount()
  const { data: signer } = useWalletClient()

  const { tokenMap } = useTokenMap({ poolOnly: true })
  const { sendTransactionAsync } = useSendTransaction()
  const { fetchWithCatchTxError } = useCatchTxError()
  const { toastSuccess } = useToast()

  const [collectMigrationHash, setCollectMigrationHash] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [isClaiming, setIsClaiming] = useState(false)
  const [claimStep, setClaimStep] = useState<1 | 2>(1)
  const [totalRewardAmount, setTotalRewardAmount] = useState(0)

  const { unwrapReward } = useUnwrapRewardV2({
    chainId,
    onDone: (tx: SendTransactionResult) => setCollectMigrationHash(tx.hash),
  })

  const nftPositionManagerAddress = useV3NFTPositionManagerContract()?.address
  const rewardToken = CAKE[chainId]
  const rewardTokenPrice = priceMap[rewardToken.address.toLowerCase()] ?? 0

  const onDismiss = useCallback(() => {
    setClaimStep(1)
    setCollectMigrationHash(null)
    setErrorMessage('')
    setIsClaiming(false)
  }, [])

  const claimPositionFees = useCallback(async () => {
    if (!account || !portfolio || !tokenMap || !nftPositionManagerAddress) return

    const options: CollectV2Options[] = []
    Object.values(portfolio).forEach((pool) => {
      if (pool.type !== 'v3') {
        return
      }

      for (const position of (pool as PortfolioV3DataBigInt).positions) {
        if (position.isStaked || (!position.token0.feeAmount && !position.token1.feeAmount)) {
          continue
        }

        const t0 = tokenMap[position.token0.address as Address]
        const t1 = tokenMap[position.token1.address as Address]

        options.push({
          tokenId: position.positionId,
          token0: new ERC20Token(chainId, t0.address, t0.decimals, t0.symbol),
          token1: new ERC20Token(chainId, t1.address, t1.decimals, t1.symbol),
          recipient: account,
        })
      }
    })

    if (!options.length) {
      return
    }

    const { calldata, value } = NonfungiblePositionManager.collectAllCallParameters(options)

    const txn = {
      to: nftPositionManagerAddress,
      data: calldata,
      value: hexToBigInt(value),
      account,
      chain: signer?.chain,
    }

    const publicClient = getViemClients({ chainId: signer?.chain?.id })

    const resp = await fetchWithCatchTxError(() =>
      publicClient.estimateGas(txn).then((estimate) => {
        const newTxn = {
          ...txn,
          gas: calculateGasMargin(estimate),
        }

        setIsClaiming(true)
        return sendTransactionAsync(newTxn)
      }),
    )
      .catch((error) => {
        if (isUserRejected(error)) {
          setErrorMessage(t('Transaction rejected'))
        } else {
          setErrorMessage(transactionErrorToUserReadableMessage(error, t))
        }

        console.error(error)
      })
      .finally(() => {
        setIsClaiming(false)
      })

    if (resp?.status) {
      setCollectMigrationHash(resp.transactionHash)
      toastSuccess(`${t('Claimed')}!`, <ToastDescriptionWithTx txHash={resp.transactionHash} />)
    }

    if (invalidatePortflio) {
      invalidatePortflio()
    }
  }, [
    portfolio,
    tokenMap,
    account,
    nftPositionManagerAddress,
    signer,
    fetchWithCatchTxError,
    sendTransactionAsync,
    toastSuccess,
    t,
    invalidatePortflio,
  ])

  const notStakedPositions = useMemo(() => {
    if (!portfolio) return null
    const _filteredPools = Object.values(portfolio).filter((pool) => pool.type === 'v3') as PortfolioV3DataBigInt[]

    const _notStakedPositions = _filteredPools.flatMap((pool) => {
      return pool.positions.filter((position) => !position.isStaked)
    })

    return _notStakedPositions
  }, [portfolio])

  const claimPositionFeesModalHeader = useCallback(
    () => (
      <div className="flex flex-col w-full space-y-4 max-h-[400px] overflow-y-auto mb-4">
        {notStakedPositions?.map((position) => {
          const token0 = tokenMap?.[position.token0.address as Address]
          const token0Price = priceMap[position.token0.address] ?? 0
          const token1 = tokenMap?.[position.token1.address as Address]
          const token1Price = priceMap[position.token1.address] ?? 0

          const token0FeeAmount = position.token0.feeAmount
          const token1FeeAmount = position.token1.feeAmount

          const totalUSD = token0Price * token0FeeAmount + token1Price * token1FeeAmount

          if (!token0FeeAmount && !token1FeeAmount) {
            return null
          }

          return (
            <div key={`claimModal1:${position.positionId}`}>
              <div className="flex items-center space-x-2 justify-between mb-2 px-2">
                <h4 className="text-on-surface text-sm text-left">#{position.positionId}</h4>

                <span className="text-sm text-on-surface">
                  {formatDollarAmountV2({
                    num: totalUSD,
                    withDollarSign: true,
                  })}
                </span>
              </div>

              <div className="bg-surface-raised rounded-xl p-4 flex flex-col space-y-3">
                <div className="flex flex-col space-y-2">
                  {!!token0 && token0FeeAmount > 0 && (
                    <CurrencyLogoWithAmount
                      logoSize={20}
                      currencyA={token0}
                      symbol={token0.symbol}
                      amount={token0FeeAmount.toLocaleString(undefined, {
                        minimumSignificantDigits: 6,
                        maximumSignificantDigits: 6,
                      })}
                      symbolClassName="text-on-surface font-bold text-sm"
                      amountClassName="text-on-surface text-sm"
                    />
                  )}

                  {!!token1 && token1FeeAmount > 0 && (
                    <CurrencyLogoWithAmount
                      logoSize={20}
                      currencyA={token1}
                      symbol={token1.symbol}
                      amount={token1FeeAmount.toLocaleString(undefined, {
                        minimumSignificantDigits: 6,
                        maximumSignificantDigits: 6,
                      })}
                      symbolClassName="text-on-surface font-bold text-sm"
                      amountClassName="text-on-surface text-sm"
                    />
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    ),
    [tokenMap, notStakedPositions, priceMap],
  )

  const [claimUnstakedFees] = useModal(
    <TransactionConfirmationModal
      title={t('Claim Position Fees')}
      attemptingTxn={isClaiming}
      customOnDismiss={onDismiss}
      hash={collectMigrationHash ?? ''}
      errorMessage={errorMessage}
      content={() => (
        <ConfirmationModalContent
          topContent={claimPositionFeesModalHeader}
          bottomContent={() => (
            <ButtonV2 variant="primary" fullWidth onClick={claimPositionFees}>
              {t('Claim')}
            </ButtonV2>
          )}
        />
      )}
      pendingText={t('claim fees')}
      maxWidth="max-w-[400px]"
    />,
    true,
    true,
    'TransactionConfirmationModalClaimPositionFees',
  )

  const stakedPositions = useMemo(() => {
    if (!portfolio) return null
    const _filteredPools = Object.values(portfolio).filter((pool) => pool.type === 'v3') as PortfolioV3DataBigInt[]

    const _stakedPositions = _filteredPools.flatMap((pool) => {
      return pool.positions.filter((position) => position.isStaked)
    })

    return _stakedPositions
  }, [portfolio])

  const isRewardsExist = useMemo(() => {
    if (!portfolio) return false

    let isExist = false

    Object.values(portfolio).forEach((pool) => {
      if (pool.type !== 'v3') {
        return
      }

      for (const position of (pool as PortfolioV3DataBigInt).positions) {
        if (position.rewards?.length) {
          isExist = true
          break
        }
      }
    })

    return isExist
  }, [portfolio])

  const unwrapRewardHandler = useCallback(
    async (reward: number) => {
      setIsClaiming(true)
      await unwrapReward(reward)
      setIsClaiming(false)
    },
    [unwrapReward],
  )

  const claimStakedFeesAndRewards = useCallback(async () => {
    if (!account || !portfolio || !tokenMap) return

    const harvestOptions: HarvestOptions[] = []
    const collectToOptions: CollectToOptions[] = []

    let _totalRewardAmount = 0

    Object.values(portfolio).forEach((pool) => {
      if (pool.type !== 'v3') {
        return
      }

      for (const position of (pool as PortfolioV3DataBigInt).positions) {
        if (!position.isStaked) {
          continue
        }

        if (position.rewards) {
          const filteredRewards = position.rewards.filter(({ amount }) => amount > 0)
          if (filteredRewards.length > 0) {
            _totalRewardAmount += filteredRewards.reduce((acc, { amount }) => acc + amount, 0)

            harvestOptions.push({
              tokenId: position.positionId,
              to: account,
            })
          }
        }

        if (position.token0.feeAmount > 0 || position.token1.feeAmount > 0) {
          collectToOptions.push({
            tokenId: position.positionId,
            recipient: account,
          })
        }
      }
    })

    setTotalRewardAmount(_totalRewardAmount)

    const { calldata, value } = MasterChefV3.harvestAndCollectToAllCallParameters({
      harvestOptions,
      collectToOptions,
    })

    const txn = {
      to: MASTERCHEFV3_ADDRESS,
      data: calldata,
      value: hexToBigInt(value),
      account,
    }

    const publicClient = getViemClients({ chainId: signer?.chain?.id })

    const resp = await fetchWithCatchTxError(() =>
      publicClient.estimateGas(txn).then((estimate) => {
        const newTxn = {
          ...txn,
          gas: calculateGasMargin(estimate),
        }

        setIsClaiming(true)
        return sendTransactionAsync(newTxn)
      }),
    )
      .then((_resp) => {
        if (!isRewardsExist && _resp?.status) {
          setCollectMigrationHash(_resp.transactionHash)
        }

        return _resp
      })
      .catch((error) => {
        if (isUserRejected(error)) {
          setErrorMessage(t('Transaction rejected'))
        } else {
          setErrorMessage(transactionErrorToUserReadableMessage(error, t))
        }

        console.error(error)
      })
      .finally(() => {
        setIsClaiming(false)
      })

    if (resp?.status) {
      toastSuccess(`${t('Claimed')}!`, <ToastDescriptionWithTx txHash={resp.transactionHash} />)

      if (isRewardsExist) {
        setClaimStep(2)
      }
    }
  }, [
    portfolio,
    tokenMap,
    account,
    signer,
    fetchWithCatchTxError,
    sendTransactionAsync,
    toastSuccess,
    t,
    isRewardsExist,
  ])

  const claimStakingRewardsAndFeesModalHeader = useCallback(
    () => (
      <>
        <div className="flex flex-col w-full space-y-4 max-h-[400px] overflow-y-auto">
          {claimStep === 1 ? (
            stakedPositions?.map((position) => {
              const token0 = tokenMap?.[position.token0.address as Address]
              const token0Price = priceMap[position.token0.address] ?? 0
              const token1 = tokenMap?.[position.token1.address as Address]
              const token1Price = priceMap[position.token1.address] ?? 0

              const token0FeeAmount = position.token0.feeAmount
              const token1FeeAmount = position.token1.feeAmount

              const rewardAmount = position.rewards?.reduce((acc, { amount }) => acc + amount, 0) ?? 0

              const totalUSD =
                token0Price * token0FeeAmount + token1Price * token1FeeAmount + rewardTokenPrice * rewardAmount

              if (!token0FeeAmount && !token1FeeAmount && !rewardAmount) {
                return null
              }

              return (
                <div key={`claimModal1:${position.positionId}`}>
                  <div className="flex items-center space-x-2 justify-between mb-2 px-2">
                    <h4 className="text-on-surface text-sm text-left">#{position.positionId}</h4>

                    <span className="text-sm text-on-surface">
                      {formatDollarAmountV2({
                        num: totalUSD,
                        withDollarSign: true,
                      })}
                    </span>
                  </div>

                  <div className="bg-surface-raised rounded-xl p-4 flex flex-col space-y-3">
                    {(token0FeeAmount > 0 || token1FeeAmount > 0) && (
                      <div>
                        <h5 className="text-[13px] mb-2">{t('Fees')}</h5>

                        <div className="flex flex-col space-y-2">
                          {!!token0 && token0FeeAmount > 0 && (
                            <CurrencyLogoWithAmount
                              logoSize={20}
                              currencyA={token0}
                              symbol={token0.symbol}
                              amount={token0FeeAmount.toLocaleString(undefined, {
                                minimumSignificantDigits: 6,
                                maximumSignificantDigits: 6,
                              })}
                              symbolClassName="text-on-surface font-bold text-sm"
                              amountClassName="text-on-surface text-sm"
                            />
                          )}

                          {!!token1 && token1FeeAmount > 0 && (
                            <CurrencyLogoWithAmount
                              logoSize={20}
                              currencyA={token1}
                              symbol={token1.symbol}
                              amount={token1FeeAmount.toLocaleString(undefined, {
                                minimumSignificantDigits: 6,
                                maximumSignificantDigits: 6,
                              })}
                              symbolClassName="text-on-surface font-bold text-sm"
                              amountClassName="text-on-surface text-sm"
                            />
                          )}
                        </div>
                      </div>
                    )}

                    {rewardAmount > 0 && (
                      <div className="border-t border-border pt-2">
                        <h5 className="text-[13px] mb-2">{t('Reward')}</h5>

                        <CurrencyLogoWithAmount
                          logoSize={20}
                          currencyA={rewardToken}
                          symbol={rewardToken.symbol}
                          amount={rewardAmount.toLocaleString(undefined, {
                            minimumSignificantDigits: 6,
                            maximumSignificantDigits: 6,
                          })}
                          symbolClassName="text-on-surface font-bold text-sm"
                          amountClassName="text-on-surface text-sm"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )
            })
          ) : (
            <div className="pb-5 text-sm text-on-surface text-center">
              <p>
                {t('You have received approximately %rewardAmount% RKLAY and wish to convert it to KAIA.', {
                  rewardAmount: formatAmount(totalRewardAmount),
                })}
              </p>
              <p className="mt-4">{t('Would you like to proceed?')}</p>
            </div>
          )}
        </div>

        {isRewardsExist && (
          <div className="w-[92%] grid grid-cols-2 my-4 mx-auto gap-2">
            <div className="col-span-1 flex flex-col items-center space-y-1.5">
              <div
                className={clsx('w-full h-0.5 rounded-l', {
                  'bg-on-surface-brand': claimStep >= 1,
                })}
              />
              <span
                className={clsx('text-center text-xs', {
                  'text-on-surface-brand': claimStep === 1,
                  'text-on-surface': claimStep > 1,
                })}
              >
                1. {t('claim rewards & fees')}{' '}
              </span>
            </div>

            <div className="col-span-1 flex flex-col items-center space-y-1.5">
              <div
                className={clsx('w-full h-0.5 rounded-r', {
                  'bg-on-surface-brand': claimStep === 2,
                  'bg-on-surface-subtlest': claimStep < 2,
                })}
              />
              <span
                className={clsx('text-center text-xs', {
                  'text-on-surface-brand': claimStep === 2,
                  'text-on-surface': claimStep < 2,
                })}
              >
                2. {t('withdraw RKLAY to KAIA')}
              </span>
            </div>
          </div>
        )}
      </>
    ),
    [
      t,
      tokenMap,
      stakedPositions,
      rewardToken,
      claimStep,
      isRewardsExist,
      totalRewardAmount,
      priceMap,
      rewardTokenPrice,
    ],
  )
  const [claimFeesAndRewards] = useModal(
    <TransactionConfirmationModal
      title={t('Claim Staking Rewards & Fees')}
      attemptingTxn={isClaiming}
      customOnDismiss={onDismiss}
      hash={collectMigrationHash ?? ''}
      errorMessage={errorMessage}
      content={() => (
        <ConfirmationModalContent
          topContent={claimStakingRewardsAndFeesModalHeader}
          bottomContent={() => (
            <ButtonV2
              variant="primary"
              fullWidth
              onClick={claimStep === 1 ? claimStakedFeesAndRewards : () => unwrapRewardHandler(totalRewardAmount)}
            >
              {claimStep === 1 ? t('Claim') : t('Withdraw')}
            </ButtonV2>
          )}
        />
      )}
      pendingText={t('claim rewards and fees')}
      maxWidth="max-w-[400px]"
    />,
    true,
    true,
    'TransactionConfirmationModalClaimRewardsAndFees',
  )

  return {
    claimUnstakedFees,
    claimFeesAndRewards,
  }
}
