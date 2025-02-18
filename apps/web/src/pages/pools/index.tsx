import { useDebounce } from '@pancakeswap/hooks'
import { useTranslation } from '@pancakeswap/localization'
import { ButtonV2, Chip, Notification, SearchBar, SegmentedControl, Spinner } from '@pancakeswap/uikit'
import clsx from 'clsx'
import Page from 'components/Layout/Page'
import { useBackTo } from 'hooks/use-back-to'
import usePortfolio, { PortfolioV3DataBigInt } from 'hooks/use-portfolio'
import useTokenPrices from 'hooks/use-token-prices'
import NextLink from 'next/link'
import { PortfolioV2Data } from 'pages/api/portfolio'
import { useMemo, useState } from 'react'
import { PoolType } from 'types'
import { Address } from 'viem'
import PoolTable from 'views/Dashboard/components/PoolTable'
import { MyPositionsSummary } from 'views/PoolsV2/components/MyPositionsSummary'
import PoolTypeSelector, { poolTypeSelectorOptions } from 'views/PoolsV2/components/PoolTypeSelector'
import { useAccount } from 'wagmi'

const PoolsPage = () => {
  const { address: account } = useAccount()

  const { t } = useTranslation()
  const { saveBackToHref } = useBackTo()
  const { prices } = useTokenPrices()
  // use swapscanner price as fallback
  const { prices: ssPrices } = useTokenPrices({ source: 'swapscanner' })

  const { portfolio } = usePortfolio({
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
      searchInput: searchKey,
      poolTypes: poolTypeOptions.map(({ value }) => value as PoolType),
      addresses: myPositionOnly && portfolio ? (Object.keys(portfolio) as Address[]) : undefined,
    },
    500,
  )

  const myPositionSummary = useMemo(() => {
    let v2 = 0
    let v3 = 0
    let tvl = 0
    let unclaimedFee = 0
    let boostReward = 0

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
          v3Pool.positions.forEach(({ rewards, token0, token1 }) => {
            const token0Price = prices?.[token0.address] ?? ssPrices?.[token0.address] ?? 0
            const token1Price = prices?.[token1.address] ?? ssPrices?.[token1.address] ?? 0
            tvl += token0Price * token0.amount
            tvl += token1Price * token1.amount
            unclaimedFee += token0Price * token0.feeAmount
            unclaimedFee += token1Price * token1.feeAmount
            rewards?.forEach(({ address, amount }) => {
              const rewardPrice = prices?.[address] ?? ssPrices?.[address] ?? 0
              boostReward += rewardPrice * amount
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
      unclaimedFeeUSD: unclaimedFee,
      boostRewardUSD: boostReward,
    }
  }, [portfolio, prices, ssPrices, account])

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
                // TODO: implement these functions
                claimFees={() => {}}
                collectRewards={() => {}}
              />
            </>
          )}
        </div>
      </div>

      {/* All Pools Section */}
      <div className="mt-8">
        <h2 className="text-xl font-medium">{t('All Pools')}</h2>
        <div className="mt-5 space-x-3 flex items-center whitespace-nowrap overflow-x-scroll">
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
          <PoolTable {...debouncedParams} portfolio={portfolio} initialSortBy="volume24H" hide7Dcolumn />
        </div>
      </div>
    </Page>
  )
}

PoolsPage.Layout = ({ children }) => <div>{children}</div>
PoolsPage.chains = []

export default PoolsPage
