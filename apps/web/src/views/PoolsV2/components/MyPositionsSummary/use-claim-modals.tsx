import { useTranslation } from '@pancakeswap/localization'
import { ChainId, ERC20Token, Token } from '@pancakeswap/sdk'
import { CAKE, CAKE_SYMBOL } from '@pancakeswap/tokens'
import { ButtonV2, CurrencyLogoWithAmount, Dots, useModal } from '@pancakeswap/uikit'
import {
  CollectToOptions,
  CollectV2Options,
  HarvestOptions,
  MasterChefV3,
  NonfungiblePositionManager,
} from '@pancakeswap/v3-sdk'
import { ConfirmationModalContent } from '@pancakeswap/widgets-internal'
import clsx from 'clsx'
import TransactionConfirmationModal from 'components/TransactionConfirmationModal'
import { MASTERCHEFV3_ADDRESS, V3_NFT_POSITION_MANAGER_ADDRESS } from 'const'
import { useTokenMap } from 'hooks/Tokens'
import useCatchTxError from 'hooks/useCatchTxError'
import { Portfolio, PortfolioV3DataBigInt, PositionV3 } from 'hooks/usePortfolio'
import { useUnwrapRewardV2 } from 'hooks/useUnwrapRewardV2'
import { useCallback, useMemo, useState } from 'react'
import { useTransactionAdder } from 'state/transactions/hooks'
import { calculateGasMargin } from 'utils'
import { isUserRejected } from 'utils/sentry'
import { transactionErrorToUserReadableMessage } from 'utils/transactionErrorToUserReadableMessage'
import { getViemClients } from 'utils/viem'
import { Address, hexToBigInt } from 'viem'
import { formatDollarAmountV2 } from 'views/Dashboard/utils/numbers'
import { useSendFeeDelegatedTx } from 'views/Swap/V3Swap/hooks/useSendFeeDelegatedTx'
import { useAccount, useWalletClient } from 'wagmi'
import { SendTransactionResult } from 'wagmi/actions'

const chainId = ChainId.KLAYTN
const publicClient = getViemClients({ chainId })

type UseClaimModalsProps = {
  priceMap: Record<string, number>
  portfolio?: Portfolio
  invalidatePortflio?: () => void
  onClaimed?: () => void
}

export default function useClaimModals({ priceMap, portfolio, invalidatePortflio, onClaimed }: UseClaimModalsProps) {
  const { t } = useTranslation()

  const { address: account } = useAccount()
  const { data: signer } = useWalletClient()

  const { tokenMap = {} } = useTokenMap({ poolOnly: true })

  const { sendTx } = useSendFeeDelegatedTx()
  const { fetchWithCatchTxError } = useCatchTxError()

  const [collectMigrationHash, setCollectMigrationHash] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [txInflight, setTxInflight] = useState(false)
  const [claimStep, setClaimStep] = useState<1 | 2>(1)

  const rewardToken = CAKE[chainId]
  const rewardTokenPrice = priceMap[rewardToken.address.toLowerCase()] ?? 0

  const {
    inflight: unwrappingInflight,
    unwrapAllReward,
    rewardBalanceStr,
  } = useUnwrapRewardV2({
    rewardToken,
    onDone: (tx: SendTransactionResult) => {
      setCollectMigrationHash(tx.hash)
      onClaimed?.()
    },
    modalKey: 'useClaimModals',
  })

  const positions = useMemo<{ staked: PositionV3[]; unstaked: PositionV3[]; rewardClaimable: boolean }>(() => {
    const staked: PositionV3[] = []
    const unstaked: PositionV3[] = []

    const v3Pools = Object.values(portfolio ?? {}).filter((pool) => pool.type === 'v3') as PortfolioV3DataBigInt[]

    v3Pools.forEach((pool) => {
      pool.positions.forEach((position) => {
        if (position.isStaked) {
          staked.push(position)
        } else {
          unstaked.push(position)
        }
      })
    })

    const rewardClaimable = staked.some((position) => !!position.rewards?.length)

    return { staked, unstaked, rewardClaimable }
  }, [portfolio])

  const onDismiss = useCallback(() => {
    setClaimStep(1)
    setCollectMigrationHash(null)
    setErrorMessage('')
    setTxInflight(false)
  }, [])

  const addTransaction = useTransactionAdder()

  const claimUnstakedFees = useCallback(async () => {
    if (!account) return

    const options: CollectV2Options[] = []

    positions.unstaked.forEach((position) => {
      if (!position.token0.feeAmount && !position.token1.feeAmount) return

      const t0 = tokenMap[position.token0.address as Address]
      const t1 = tokenMap[position.token1.address as Address]

      if (!t0 || !t1) return

      options.push({
        tokenId: position.positionId,
        token0: new ERC20Token(chainId, t0.address, t0.decimals, t0.symbol),
        token1: new ERC20Token(chainId, t1.address, t1.decimals, t1.symbol),
        recipient: account,
      })
    })

    if (!options.length) return

    const { calldata, value } = NonfungiblePositionManager.collectAllCallParameters(options)

    const txn = {
      to: V3_NFT_POSITION_MANAGER_ADDRESS,
      data: calldata,
      value: hexToBigInt(value),
      account,
      chain: signer?.chain,
    }

    const resp = await fetchWithCatchTxError(() =>
      publicClient.estimateGas(txn).then((estimate) => {
        const newTxn = {
          ...txn,
          gas: calculateGasMargin(estimate),
        }

        setTxInflight(true)
        return sendTx(newTxn).then((response) => {
          addTransaction(
            { hash: response.hash },
            {
              type: 'collect-all-fees',
              summary: 'Collect all fees',
            },
          )

          return response
        })
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
        setTxInflight(false)
      })

    if (resp?.status) {
      setCollectMigrationHash(resp.transactionHash)
    }

    if (invalidatePortflio) {
      invalidatePortflio()
    }

    onClaimed?.()
  }, [
    positions.unstaked,
    tokenMap,
    account,
    signer,
    fetchWithCatchTxError,
    sendTx,
    t,
    invalidatePortflio,
    addTransaction,
    onClaimed,
  ])

  const [openClaimUnstakedFeesModal] = useModal(
    <TransactionConfirmationModal
      title={t('Claim Position Fees')}
      attemptingTxn={txInflight || unwrappingInflight}
      customOnDismiss={onDismiss}
      hash={collectMigrationHash ?? ''}
      errorMessage={errorMessage}
      content={
        <ConfirmationModalContent
          topContent={
            <ClaimUnstakedFeesModalHeader
              unstakedPositions={positions.unstaked}
              tokenMap={tokenMap}
              priceMap={priceMap}
            />
          }
          bottomContent={
            <ButtonV2 variant="primary" fullWidth onClick={claimUnstakedFees}>
              {t('Claim')}
            </ButtonV2>
          }
        />
      }
      pendingText={t('claim fees')}
      maxWidth="max-w-[400px]"
    />,
    true,
    true,
    'TransactionConfirmationModalClaimPositionFees',
    [positions.unstaked, collectMigrationHash, txInflight, unwrappingInflight],
  )

  const claimStakedFeesAndRewards = useCallback(async () => {
    if (!account) return

    const harvestOptions: HarvestOptions[] = []
    const collectToOptions: CollectToOptions[] = []

    positions.staked.forEach((position) => {
      if (position.rewards) {
        const filteredRewards = position.rewards.filter(({ amount }) => amount > 0)
        if (filteredRewards.length > 0) {
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
    })

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

    const resp = await fetchWithCatchTxError(() =>
      publicClient.estimateGas(txn).then(async (estimate) => {
        const newTxn = {
          ...txn,
          gas: calculateGasMargin(estimate),
        }

        setTxInflight(true)
        const response = await sendTx(newTxn).then((res) => {
          addTransaction(
            { hash: res.hash },
            {
              type: 'harvest-and-collect-all',
              summary: 'Harvest and collect all',
            },
          )

          return res
        })

        return response
      }),
    )
      .then((_resp) => {
        if (!positions.rewardClaimable && _resp?.status) {
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
        setTxInflight(false)
      })

    if (resp?.status) {
      if (positions.rewardClaimable) {
        setClaimStep(2)
      }
    }

    onClaimed?.()
  }, [
    positions.staked,
    account,
    fetchWithCatchTxError,
    sendTx,
    t,
    positions.rewardClaimable,
    addTransaction,
    onClaimed,
  ])

  const [openClaimFeesAndRewardsModal] = useModal(
    <TransactionConfirmationModal
      title={t('Claim Boost Rewards & Fees')}
      attemptingTxn={txInflight || unwrappingInflight}
      customOnDismiss={onDismiss}
      hash={collectMigrationHash ?? ''}
      errorMessage={errorMessage}
      content={
        <ConfirmationModalContent
          topContent={
            <ClaimStakedFeesAndRewardsModalHeader
              stakedPositions={positions.staked}
              rewardToken={rewardToken}
              rewardTokenPrice={rewardTokenPrice}
              rewardBalanceStr={rewardBalanceStr}
              rewardClaimable={positions.rewardClaimable}
              claimStep={claimStep}
              tokenMap={tokenMap}
              priceMap={priceMap}
            />
          }
          bottomContent={
            <ButtonV2
              variant="primary"
              fullWidth
              onClick={claimStep === 1 ? claimStakedFeesAndRewards : () => unwrapAllReward()}
            >
              {claimStep === 1 ? t('Claim') : t('Unwrap to KAIA')}
            </ButtonV2>
          }
        />
      }
      pendingText={t('claim rewards and fees')}
      maxWidth="max-w-[400px]"
    />,
    true,
    true,
    'TransactionConfirmationModalClaimRewardsAndFees',
    [positions.staked, collectMigrationHash, txInflight, rewardToken, rewardBalanceStr, claimStep],
  )

  return {
    openClaimUnstakedFeesModal,
    openClaimFeesAndRewardsModal,
  }
}

function ClaimUnstakedFeesModalHeader({
  unstakedPositions,
  tokenMap,
  priceMap,
}: {
  unstakedPositions: PositionV3[]
  tokenMap: Record<string, Token>
  priceMap: Record<string, number>
}) {
  return (
    <div className="flex flex-col w-full space-y-4 max-h-[400px] overflow-y-auto mb-4">
      {unstakedPositions.map((position) => {
        const token0 = tokenMap?.[position.token0.address as Address]
        const token0Price = priceMap[position.token0.address] ?? 0
        const token1 = tokenMap?.[position.token1.address as Address]
        const token1Price = priceMap[position.token1.address] ?? 0

        const token0FeeAmount = position.token0.feeAmount
        const token1FeeAmount = position.token1.feeAmount

        const totalUSD = token0Price * token0FeeAmount + token1Price * token1FeeAmount
        if (!totalUSD) {
          return null
        }

        return (
          <div key={`claimModal1:${position.positionId}`}>
            <div className="flex items-center space-x-2 justify-between mb-2 px-2">
              <h4 className="text-on-surface text-sm text-left">#{position.positionId}</h4>

              <span className="text-sm text-on-surface">
                {formatDollarAmountV2({ num: totalUSD, withDollarSign: true })}
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
  )
}

function ClaimStakedFeesAndRewardsModalHeader({
  stakedPositions,
  rewardToken,
  rewardTokenPrice,
  rewardBalanceStr,
  rewardClaimable,
  claimStep,
  tokenMap,
  priceMap,
}: {
  stakedPositions: PositionV3[]
  rewardToken: Token
  rewardTokenPrice: number
  rewardBalanceStr: string
  rewardClaimable: boolean
  claimStep: 1 | 2
  tokenMap: Record<string, Token>
  priceMap: Record<string, number>
}) {
  const { t } = useTranslation()

  return (
    <>
      <div className="flex flex-col w-full space-y-4 max-h-[400px] overflow-y-auto">
        {claimStep === 1 ? (
          stakedPositions.map((position) => {
            const token0 = tokenMap?.[position.token0.address as Address]
            const token0Price = priceMap[position.token0.address] ?? 0
            const token1 = tokenMap?.[position.token1.address as Address]
            const token1Price = priceMap[position.token1.address] ?? 0

            const token0FeeAmount = position.token0.feeAmount
            const token1FeeAmount = position.token1.feeAmount

            const rewardAmount = position.rewards?.reduce((acc, { amount }) => acc + amount, 0) ?? 0

            const totalUSD =
              token0Price * token0FeeAmount + token1Price * token1FeeAmount + rewardTokenPrice * rewardAmount
            if (!totalUSD) {
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
                    <div
                      className={clsx({
                        'pt-2 border-t border-border': token0FeeAmount > 0 || token1FeeAmount > 0,
                      })}
                    >
                      <h5 className="text-[13px] mb-2">{t('Reward')}</h5>

                      <CurrencyLogoWithAmount
                        logoSize={20}
                        currencyA={rewardToken}
                        symbol={CAKE_SYMBOL}
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
            {+rewardBalanceStr > 0 ? (
              <>
                <p className="break-keep">
                  {t('You are holding approximately {{rewardAmount}} RKAIA and wish to convert it to KAIA.', {
                    rewardAmount: rewardBalanceStr,
                  })}
                </p>
                <p className="mt-4">{t('Would you like to proceed?')}</p>
              </>
            ) : (
              <Dots style={{ fontSize: '14px' }}>{t('Loading your RKAIA balance')}</Dots>
            )}
          </div>
        )}
      </div>

      {rewardClaimable && (
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
              2. {t('unwrap RKAIA to KAIA')}
            </span>
          </div>
        </div>
      )}
    </>
  )
}
