import { useDebounce } from '@pancakeswap/hooks'
import { useTranslation } from '@pancakeswap/localization'
import { ChainId, ERC20Token } from '@pancakeswap/sdk'
import { CAKE } from '@pancakeswap/tokens'
import {
  ButtonV2,
  Chip,
  CurrencyLogoWithAmount,
  Notification,
  SearchBar,
  SegmentedControl,
  Spinner,
  useModal,
  useToast,
} from '@pancakeswap/uikit'
import {
  CollectToOptions,
  CollectV2Options,
  HarvestOptions,
  MasterChefV3,
  NonfungiblePositionManager,
} from '@pancakeswap/v3-sdk'
import { ConfirmationModalContent } from '@pancakeswap/widgets-internal'
import clsx from 'clsx'
import Page from 'components/Layout/Page'
import { ToastDescriptionWithTx } from 'components/Toast'
import TransactionConfirmationModal from 'components/TransactionConfirmationModal'
import { useTokenMap } from 'hooks/Tokens'
import { useBackTo } from 'hooks/use-back-to'
import usePortfolio, { PortfolioV3DataBigInt } from 'hooks/use-portfolio'
import useTokenPrices from 'hooks/use-token-prices'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { useCakePrice } from 'hooks/useCakePrice'
import useCatchTxError from 'hooks/useCatchTxError'
import { useMasterchefV3, useV3NFTPositionManagerContract } from 'hooks/useContract'
import { useUnwrapRewardV2 } from 'hooks/useUnwrapRewardV2'
import NextLink from 'next/link'
import { PortfolioV2Data } from 'pages/api/portfolio'
import { useCallback, useMemo, useState } from 'react'
import { PoolType } from 'types'
import { calculateGasMargin } from 'utils'
import { formatAmount } from 'utils/formatInfoNumbers'
import { isUserRejected } from 'utils/sentry'
import { transactionErrorToUserReadableMessage } from 'utils/transactionErrorToUserReadableMessage'
import { getViemClients } from 'utils/viem'
import { Address, hexToBigInt } from 'viem'
import PoolTable from 'views/Dashboard/components/PoolTable'
import { formatDollarAmountV2 } from 'views/Dashboard/utils/numbers'
import { MyPositionsSummary } from 'views/PoolsV2/components/MyPositionsSummary'
import PoolTypeSelector, { poolTypeSelectorOptions } from 'views/PoolsV2/components/PoolTypeSelector'
import { useAccount, useSendTransaction, useWalletClient } from 'wagmi'
import { SendTransactionResult } from 'wagmi/actions'

const PoolsPage = () => {
  const { address: account } = useAccount()

  const { t } = useTranslation()
  const { saveBackToHref } = useBackTo()
  const { prices } = useTokenPrices()
  // use swapscanner price as fallback
  const { prices: ssPrices } = useTokenPrices({ source: 'swapscanner' })

  const { portfolio, mutatePortfolio } = usePortfolio({
    account,
    poolTypes: ['v3', 'v2'],
  })

  const [boostedOnly, setBoostedOnly] = useState(false)
  const [searchKey, setSearchKey] = useState('')
  const [myPositionOnly, setMyPositionOnly] = useState(false)
  const [poolTypeOptions, setPoolTypeOptions] = useState(poolTypeSelectorOptions)

  const debouncedParams = useDebounce(
    {
      boostedOnly,
      searchKey,
      poolTypes: poolTypeOptions.map(({ value }) => value as PoolType),
      addresses: myPositionOnly && portfolio ? (Object.keys(portfolio) as Address[]) : undefined,
    },
    500,
  )

  const myPositionSummary = useMemo(() => {
    let v2 = 0
    let v3 = 0
    let tvl = 0
    let unclaimedFeeUSD = 0
    let unclaimedRewardAndFeeUSD = 0

    if ((account && !portfolio) || !(prices || ssPrices)) {
      return null
    }

    if (portfolio) {
      Object.values(portfolio).forEach((pool) => {
        if (pool.type === 'v2') {
          const v2Pool = pool as PortfolioV2Data
          v2 += 1
          const token0Price = prices?.[v2Pool.token0.address] ?? ssPrices?.[v2Pool.token0.address] ?? 0
          const token1Price = prices?.[v2Pool.token1.address] ?? ssPrices?.[v2Pool.token1.address] ?? 0
          tvl += token0Price * v2Pool.token0.amount
          tvl += token1Price * v2Pool.token1.amount
        } else {
          const v3Pool = pool as PortfolioV3DataBigInt
          v3 += v3Pool.positions.length
          v3Pool.positions.forEach(({ isStaked, rewards, token0, token1 }) => {
            const token0Price = prices?.[token0.address] ?? ssPrices?.[token0.address] ?? 0
            const token1Price = prices?.[token1.address] ?? ssPrices?.[token1.address] ?? 0
            tvl += token0Price * token0.amount
            tvl += token1Price * token1.amount

            if (isStaked) {
              unclaimedRewardAndFeeUSD += token0Price * token0.feeAmount
              unclaimedRewardAndFeeUSD += token1Price * token1.feeAmount
            } else {
              unclaimedFeeUSD += token0Price * token0.feeAmount
              unclaimedFeeUSD += token1Price * token1.feeAmount
            }

            rewards?.forEach(({ address, amount }) => {
              const rewardPrice = prices?.[address] ?? ssPrices?.[address] ?? 0
              unclaimedRewardAndFeeUSD += rewardPrice * amount
            })
          })
        }
      })
    }

    return {
      positionCount: {
        v2,
        v3,
      },
      tvlUSD: tvl,
      unclaimedFeeUSD,
      unclaimedRewardAndFeeUSD,
    }
  }, [portfolio, prices, ssPrices, account])

  const nftPositionManagerAddress = useV3NFTPositionManagerContract()?.address
  const { chainId } = useActiveChainId()
  const { data: signer } = useWalletClient()
  const { fetchWithCatchTxError } = useCatchTxError()
  const { sendTransactionAsync } = useSendTransaction()
  const { toastSuccess } = useToast()

  const [collectMigrationHash, setCollectMigrationHash] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [isClaiming, setIsClaiming] = useState(false)
  const [claimStep, setClaimStep] = useState<1 | 2>(1)
  const onDismiss = useCallback(() => {
    setClaimStep(1)
    setCollectMigrationHash(null)
    setErrorMessage('')
    setIsClaiming(false)
  }, [])

  const { tokenMap } = useTokenMap({ poolOnly: true })
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
          token0: new ERC20Token(+chainId, t0.address, t0.decimals, t0.symbol),
          token1: new ERC20Token(+chainId, t1.address, t1.decimals, t1.symbol),
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

    mutatePortfolio()
  }, [
    portfolio,
    tokenMap,
    account,
    chainId,
    nftPositionManagerAddress,
    signer,
    fetchWithCatchTxError,
    sendTransactionAsync,
    toastSuccess,
    t,
    mutatePortfolio,
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
          const token0Price = prices?.[position.token0.address] ?? ssPrices?.[position.token0.address] ?? 0
          const token1 = tokenMap?.[position.token1.address as Address]
          const token1Price = prices?.[position.token1.address] ?? ssPrices?.[position.token1.address] ?? 0

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
    [tokenMap, notStakedPositions, prices, ssPrices],
  )

  const [onClaimFees] = useModal(
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

  const rewardToken = useMemo(() => CAKE[chainId as ChainId], [chainId])
  const cakePrice = useCakePrice()
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

  const [totalRewardAmount, setTotalRewardAmount] = useState(0)
  const { unwrapReward } = useUnwrapRewardV2({
    chainId,
    onDone: (tx: SendTransactionResult) => setCollectMigrationHash(tx.hash),
  })

  const unwrapRewardHandler = useCallback(
    async (reward: number) => {
      setIsClaiming(true)
      await unwrapReward(reward)
      setIsClaiming(false)
    },
    [unwrapReward],
  )

  const masterChefV3Address = useMasterchefV3()?.address
  const claimStakedFeesAndRewards = useCallback(async () => {
    if (!account || !portfolio || !tokenMap || !masterChefV3Address) return

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
      to: masterChefV3Address,
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
    masterChefV3Address,
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
              const token0Price = prices?.[position.token0.address] ?? ssPrices?.[position.token0.address] ?? 0
              const token1 = tokenMap?.[position.token1.address as Address]
              const token1Price = prices?.[position.token1.address] ?? ssPrices?.[position.token1.address] ?? 0

              const token0FeeAmount = position.token0.feeAmount
              const token1FeeAmount = position.token1.feeAmount

              const rewardAmount = position.rewards?.reduce((acc, { amount }) => acc + amount, 0) ?? 0

              const totalUSD =
                token0Price * token0FeeAmount + token1Price * token1FeeAmount + cakePrice.toNumber() * rewardAmount

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
      cakePrice,
      prices,
      ssPrices,
    ],
  )
  const [onClaimStakingRewardsAndFees] = useModal(
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

  return (
    <Page>
      {/* Header Section */}
      <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between">
        <div>
          <h1 className="text-[40px] font-medium">{t('Pools')}</h1>
          <p className="text-sm text-on-surface-subtlest">{t('Stake LP tokens to earn')}</p>
        </div>
        <NextLink href="/add" className="mt-4 xs:mt-0">
          <ButtonV2 variant="secondary" onClick={() => saveBackToHref()}>
            {t('Add Liquidity')}
          </ButtonV2>
        </NextLink>
      </div>

      {/* My Positions Section */}
      <div className="mt-8">
        <h2 className="text-xl font-medium">{t('My Positions')}</h2>
        <div className="mt-5">
          {myPositionSummary === null ? (
            <div className="rounded-xl p-6 bg-surface-raised flex justify-center items-center min-h-[180px]">
              <Spinner />
            </div>
          ) : (
            <>
              <div
                className={clsx('my-5', {
                  hidden: myPositionSummary?.positionCount.v2 + myPositionSummary?.positionCount.v3 > 0,
                })}
              >
                <Notification variant="info" fullWidth className="!bg-surface-raised">
                  {t('Add liquidity to the pool and claim fees. View your positions here.')}
                </Notification>
              </div>
              <MyPositionsSummary
                {...myPositionSummary}
                claimFees={onClaimFees}
                collectRewards={onClaimStakingRewardsAndFees}
              />
            </>
          )}
        </div>
      </div>

      {/* All Pools Section */}
      <div className="mt-8">
        <h2 className="text-xl font-medium">{t('All Pools')}</h2>
        <div className="mt-5 space-x-3 flex items-center whitespace-nowrap overflow-x-auto">
          <div className="inline-block">
            <SegmentedControl
              options={['All', 'Boost🔥']}
              value={boostedOnly ? 'Boost🔥' : 'All'}
              onChange={(value) => setBoostedOnly(value === 'Boost🔥')}
            />
          </div>
          <div
            className={clsx('inline-block', {
              hidden: Object.keys(portfolio ?? {}).length === 0,
            })}
          >
            <Chip
              label={t('My Position')}
              selected={myPositionOnly}
              setSelected={(v) => {
                if (v) {
                  setMyPositionOnly(true)
                  setPoolTypeOptions(poolTypeSelectorOptions)
                } else {
                  setMyPositionOnly(false)
                }
              }}
            />
          </div>
          <div className="inline-block flex-1 !mx-0" />
          <div className="hidden md:inline-block">
            <SearchBar value={searchKey} onChange={(e) => setSearchKey(e.target.value)} placeholder={t('Search...')} />
          </div>
          <div className="inline-block">
            <PoolTypeSelector
              selectedPoolTypes={poolTypeOptions}
              onSelectPoolTypes={(poolTypes) => setPoolTypeOptions(poolTypes as any)}
            />
          </div>
        </div>
        <div className="mt-3 md:hidden">
          <SearchBar
            fullWidth
            value={searchKey}
            onChange={(e) => setSearchKey(e.target.value)}
            placeholder={t('Search...')}
          />
        </div>
        <div className="mt-5">
          {debouncedParams.poolTypes.length === 0 ? (
            <div className="mt-8">
              <p className="text-on-surface">{t('Please select at least one pool type.')}</p>
              <ButtonV2
                className="mt-4"
                variant="secondary"
                onClick={() => setPoolTypeOptions(poolTypeSelectorOptions)}
              >
                {t('Select All')}
              </ButtonV2>
            </div>
          ) : (
            <PoolTable {...debouncedParams} portfolio={portfolio} initialSortBy="apy24H" openable />
          )}
        </div>
      </div>
    </Page>
  )
}

PoolsPage.Layout = ({ children }) => <div>{children}</div>
PoolsPage.chains = []

export default PoolsPage
