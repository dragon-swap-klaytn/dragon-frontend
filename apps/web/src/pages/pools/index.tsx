import { ChainId } from '@pancakeswap/chains'
import { useDebounce } from '@pancakeswap/hooks'
import { useTranslation } from '@pancakeswap/localization'
import { WNATIVE } from '@pancakeswap/sdk'
import { CAKE } from '@pancakeswap/tokens'
import { ButtonV2, Chip, Notification, SearchBar, SegmentedControl, Spinner } from '@pancakeswap/uikit'
import clsx from 'clsx'
import Page from 'components/Layout/Page'
import { DEFAULT_POOLS_FILTERS } from 'const'
import usePortfolio, { PortfolioV3DataBigInt } from 'hooks/usePortfolio'
import useRouterReady from 'hooks/useRouterReady'
import useTokenBalance from 'hooks/useTokenBalance'
import useTokenPricesWithFallback from 'hooks/useTokenPricesWithFallback'
import { useUnwrapRewardV2 } from 'hooks/useUnwrapRewardV2'
import NextLink from 'next/link'
import { useRouter } from 'next/router'
import { PortfolioV2Data } from 'pages/api/portfolio'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { PoolType } from 'types'
import useDeepCompareEffect from 'use-deep-compare-effect'
import isEmptyObject from 'utils/isEmptyObject'
import { getDefaultStaticProps } from 'utils/pageUtils'
import PoolTable from 'views/Dashboard/components/PoolTable'
import { MyPositionsSummary } from 'views/PoolsV2/components/MyPositionsSummary'
import PoolTypeSelector, {
  PoolTypeSelectorOptions,
  poolTypeSelectorOptions,
} from 'views/PoolsV2/components/PoolTypeSelector'
import { Address, useAccount } from 'wagmi'

type PoolsBaseParams = {
  poolTypes: PoolType[]
  boostedOnly: boolean
  searchKey: string
  myPositionOnly: boolean
  addresses?: Address[]
}

export type PortfolioWithDepositedTvlData = (PortfolioV2Data | PortfolioV3DataBigInt) & { depositedTvl: number }
export type PortfolioWithDepositedTvlMap = {
  [poolId: Address]: PortfolioWithDepositedTvlData
}

const PoolsPage = () => {
  const { address: account } = useAccount()

  const { t } = useTranslation()

  const { portfolio, mutatePortfolio } = usePortfolio({
    account,
    poolTypes: ['v3', 'v2'],
  })

  const [boostedOnly, setBoostedOnly] = useState(DEFAULT_POOLS_FILTERS.boostedOnly)
  const [searchKey, setSearchKey] = useState(DEFAULT_POOLS_FILTERS.searchKey)
  const [myPositionOnly, setMyPositionOnly] = useState(DEFAULT_POOLS_FILTERS.myPositionOnly)
  const [poolTypeOptions, setPoolTypeOptions] = useState(poolTypeSelectorOptions)

  const debouncedSearchKey = useDebounce(searchKey, 500)

  const router = useRouter()
  const isRouterReady = useRouterReady()

  const [baseParams, setBaseParams] = useState<PoolsBaseParams>({} as PoolsBaseParams)
  const { priceMap } = useTokenPricesWithFallback()

  const portfolioWithDepositedTvl = useMemo(() => {
    if (!portfolio || !priceMap || !Object.keys(priceMap).length) return {}

    return Object.entries(portfolio).reduce((acc, [poolId, position]) => {
      let depositedTvl = 0
      if (position.type === 'v2') {
        const { token0, token1 } = position as PortfolioV2Data

        const token0Value = (priceMap?.[token0.address] || 0) * token0.amount
        const token1Value = (priceMap?.[token1.address] || 0) * token1.amount

        depositedTvl = token0Value + token1Value
      } else {
        const { positions } = position as PortfolioV3DataBigInt

        for (const pos of positions) {
          const { token0, token1 } = pos

          const token0Value = (priceMap?.[token0.address] || 0) * token0.amount
          const token1Value = (priceMap?.[token1.address] || 0) * token1.amount

          depositedTvl += token0Value + token1Value
        }
      }

      return {
        ...acc,
        [poolId]: {
          ...position,
          depositedTvl,
        },
      }
    }, {} as PortfolioWithDepositedTvlMap)
  }, [portfolio, priceMap])

  const positions = useMemo(
    () =>
      portfolio
        ? Object.values(portfolio).filter(({ type }) => poolTypeOptions.find((option) => option.value === type))
        : [],
    [portfolio, poolTypeOptions],
  )

  const sortedPositionPoolIds = useMemo(() => {
    if (!priceMap || !Object.keys(priceMap).length || !myPositionOnly) return []

    const positionsWithDepositedTvl = positions.reduce((acc, position) => {
      let depositedTvl = 0
      if (position.type === 'v2') {
        const { token0, token1 } = position as PortfolioV2Data

        const token0Value = (priceMap?.[token0.address] || 0) * token0.amount
        const token1Value = (priceMap?.[token1.address] || 0) * token1.amount

        depositedTvl = token0Value + token1Value
      } else {
        const { positions } = position as PortfolioV3DataBigInt

        for (const pos of positions) {
          const { token0, token1 } = pos

          const token0Value = (priceMap?.[token0.address] || 0) * token0.amount
          const token1Value = (priceMap?.[token1.address] || 0) * token1.amount

          depositedTvl += token0Value + token1Value
        }
      }

      return {
        ...acc,
        [position.poolId]: depositedTvl,
      }
    }, {} as { [poolId: Address]: number })

    const sortedPositionPools = Object.entries(positionsWithDepositedTvl)
      .sort(([, a], [, b]) => a - b)
      .map(([poolId]) => poolId as Address)

    return sortedPositionPools
  }, [priceMap, positions, myPositionOnly])

  useEffect(() => {
    if (!router.isReady || !isRouterReady) return
    if (!isEmptyObject(baseParams)) return

    const {
      poolsTypes: _poolTypes,
      boostedOnly: _boostedOnly,
      poolsSearchKey: _searchKey,
      myPositionOnly: _myPositionOnly,
    } = router.query || {}

    if (!_poolTypes && !_boostedOnly && !_searchKey && !_myPositionOnly) {
      setBaseParams({
        poolTypes: DEFAULT_POOLS_FILTERS.poolTypes,
        boostedOnly: DEFAULT_POOLS_FILTERS.boostedOnly,
        searchKey: DEFAULT_POOLS_FILTERS.searchKey,
        myPositionOnly: DEFAULT_POOLS_FILTERS.myPositionOnly,
      })

      return
    }

    let newOptions: PoolTypeSelectorOptions | undefined
    if (typeof _poolTypes === 'string') {
      const splited = _poolTypes.split(',').sort((a, b) => a.localeCompare(b))
      const types = splited.every((type) => poolTypeSelectorOptions.some((option) => option.value === type))
        ? (splited as PoolType[])
        : poolTypeSelectorOptions.map(({ value }) => value as PoolType)

      const filtered = poolTypeSelectorOptions.filter((option) => types.includes(option.value))

      setPoolTypeOptions((prev) => {
        if (JSON.stringify(prev) === JSON.stringify(filtered)) {
          newOptions = prev
        }

        newOptions = filtered

        return newOptions
      })
    }

    const newBoostedOnly = _boostedOnly === 'true'
    setBoostedOnly(newBoostedOnly)

    const newSearchKey = typeof _searchKey === 'string' ? _searchKey : ''
    setSearchKey(newSearchKey)

    const newMyPositionOnly = _myPositionOnly === 'true'
    setMyPositionOnly(newMyPositionOnly)

    setBaseParams({
      poolTypes: (newOptions ?? poolTypeSelectorOptions).map(({ value }) => value as PoolType),
      boostedOnly: newBoostedOnly,
      searchKey: newSearchKey,
      myPositionOnly: newMyPositionOnly,
      addresses: sortedPositionPoolIds,
    })
  }, [router.query, router.isReady, baseParams, isRouterReady, sortedPositionPoolIds])

  useDeepCompareEffect(() => {
    if (isEmptyObject(baseParams) || !isRouterReady) return
    setBaseParams({
      poolTypes: poolTypeOptions.map(({ value }) => value as PoolType),
      boostedOnly,
      myPositionOnly,
      searchKey: debouncedSearchKey,
      addresses: sortedPositionPoolIds,
    })
  }, [
    poolTypeOptions,
    boostedOnly,
    myPositionOnly,
    debouncedSearchKey,
    baseParams,
    isRouterReady,
    sortedPositionPoolIds,
  ])

  const cake = CAKE[ChainId.KLAYTN]
  const { balance: cakeBalance, refetch: refetchCakeBalance } = useTokenBalance(cake.address)

  const { unwrapAllReward } = useUnwrapRewardV2({
    rewardToken: cake,
    onDone: () => {
      refetchCakeBalance()
    },
    modalKey: 'unwrapAllCake',
  })

  const wNative = WNATIVE[ChainId.KLAYTN]
  const { balance: wNativeBalance, refetch: refetchWNative } = useTokenBalance(wNative.address)

  const { unwrapAllReward: unwrapAllWNative } = useUnwrapRewardV2({
    rewardToken: wNative,
    onDone: () => {
      refetchWNative()
    },
    modalKey: 'unwrapAllWNative',
  })

  const refetchHandler = useCallback(() => {
    refetchCakeBalance()
    refetchWNative()
    mutatePortfolio()
  }, [refetchCakeBalance, refetchWNative, mutatePortfolio])

  const resetPoolTypeOptions = useCallback(() => setPoolTypeOptions(poolTypeSelectorOptions), [])
  const resetBaseParams = useCallback(() => {
    setBaseParams({} as PoolsBaseParams)
    setBoostedOnly(DEFAULT_POOLS_FILTERS.boostedOnly)
    setSearchKey(DEFAULT_POOLS_FILTERS.searchKey)
    setMyPositionOnly(DEFAULT_POOLS_FILTERS.myPositionOnly)
    setPoolTypeOptions(poolTypeSelectorOptions)
  }, [])

  return (
    <Page title={t('Pools')} image="/images/og-images/pools.jpeg" className="mt-[60px]">
      {/* Header Section */}
      <div className="flex flex-col s:flex-row s:items-center s:justify-between">
        <div>
          <h1 className="text-[40px] font-medium">{t('Pools')}</h1>
          <p className="text-sm text-on-surface-subtlest">{t('Supply liquidity and maximize your yield.')}</p>
        </div>
        <NextLink href="/add" className="s:ml-4 mt-4 s:mt-0">
          <ButtonV2 variant="secondary" onClick={() => {}}>
            {t('Add Liquidity')}
          </ButtonV2>
        </NextLink>
      </div>

      {/* My Positions Section */}
      <div className="mt-8">
        <h2 className="text-xl font-medium">{t('My Positions')}</h2>
        <Notification variant="info" fullWidth className="mt-5">
          {t('Add liquidity to the pool and earn fees. View your positions here.')}
        </Notification>
        <div className="mt-5">
          {account && !portfolio ? (
            <div className="rounded-xl p-6 bg-surface-raised flex justify-center items-center min-h-[180px]">
              <Spinner />
            </div>
          ) : (
            <MyPositionsSummary
              onMyPositionsClick={() => {
                if (!myPositionOnly) {
                  setMyPositionOnly(true)
                }
                document.getElementById('pool-table')?.scrollIntoView({ behavior: 'smooth' })
              }}
              portfolio={portfolio}
              invalidatePortflio={() => mutatePortfolio()}
              onClaimed={refetchHandler}
            />
          )}
        </div>

        {!wNativeBalance.isZero() && (
          <div className="flex items-center justify-end w-full space-x-2 mt-2">
            <span className="text-sm text-right text-on-surface-subtle">
              {t('WKAIA Balances')}:{' '}
              {wNativeBalance
                .div(10 ** wNative.decimals)
                .precision(6)
                .toString()}
            </span>
            <UnwrapButton onClick={unwrapAllWNative} />
          </div>
        )}

        {!cakeBalance.isZero() && (
          <div className="flex items-center justify-end w-full space-x-2 mt-2">
            <span className="text-sm text-right text-on-surface-subtle">
              {t('RKAIA Balances')}:{' '}
              {cakeBalance
                .div(10 ** cake.decimals)
                .precision(6)
                .toString()}
            </span>
            <UnwrapButton onClick={unwrapAllReward} />
          </div>
        )}
      </div>

      {/* All Pools Section */}
      <div className="mt-8">
        <h2 id="pool-table" className="text-xl font-medium">
          {t('All Pools')}
        </h2>
        <div className="mt-5 space-x-3 flex items-center whitespace-nowrap overflow-x-auto">
          <div className="inline-block">
            <SegmentedControl
              options={['All', 'Boost🔥']}
              value={boostedOnly ? 'Boost🔥' : 'All'}
              onChange={(value) => setBoostedOnly(value === 'Boost🔥')}
              useTranslationOption
            />
          </div>
          <div
            className={clsx('inline-block', {
              hidden: isEmptyObject(portfolio ?? {}),
            })}
          >
            <Chip label={t('My Positions')} selected={myPositionOnly} setSelected={setMyPositionOnly} />
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
        <div className="mt-5 overflow-x-auto">
          <PoolTable
            baseParams={baseParams}
            portfolio={portfolioWithDepositedTvl}
            mutatePortfolio={mutatePortfolio}
            initialSortBy="apy24H"
            openable
            resetPoolTypeOptions={resetPoolTypeOptions}
            resetBaseParams={resetBaseParams}
          />
        </div>
      </div>
    </Page>
  )
}

export default PoolsPage

export const getStaticProps = getDefaultStaticProps(['common'])

function UnwrapButton({ onClick }: { onClick: () => void }) {
  const { t } = useTranslation()

  return (
    <button
      type="button"
      onClick={onClick}
      className="bg-brand-subtle text-on-surface-brand-subtle text-xs h-6 px-2 rounded-xl hover:opacity-70"
    >
      {t('Unwrap to KAIA')}
    </button>
  )
}
