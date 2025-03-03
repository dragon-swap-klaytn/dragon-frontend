import { useTranslation } from '@pancakeswap/localization'
import { BreadscrumbsV2, ButtonV2, CurrencyLogoWithSymbol, ExternalLink, Spinner, TagV2 } from '@pancakeswap/uikit'
import { ArrowUp } from '@phosphor-icons/react'
import clsx from 'clsx'
import { AddLiquidityButtonV2 } from 'components/AddLiquidityButtonV2'
import Page from 'components/Layout/Page'
import usePoolPositions from 'hooks/usePoolPositions'
import { PositionV2, PositionV3 } from 'hooks/usePortfolio'
import useTokenPrices from 'hooks/useTokenPrices'
import { useV3Pool } from 'hooks/v3/use-v3-pool'
import NextLink from 'next/link'
import { PoolParsed, PoolV2Parsed, PoolV3Parsed } from 'pages/api/pools'
import { useMemo } from 'react'
import { PoolType } from 'types'
import { getBlockExploreLink, getBlockExploreName } from 'utils'
import { formatAmount } from 'utils/formatInfoNumbers'
import { getDefaultStaticPaths, getTokenStaticProps } from 'utils/pageUtils'
import { unwrapWKAIAAdress } from 'utils/unwrap-wkaia-address'
import { Address } from 'viem'
import Percent from 'views/Dashboard/components/Percent'
import { PoolChart } from 'views/Dashboard/components/PoolChart'
import { TokenRate } from 'views/Dashboard/components/TokenRate'
import usePools from 'views/Dashboard/hooks/usePools'
import { formatDollarAmount } from 'views/Dashboard/utils/numbers'
import { V3PositionCard } from 'views/PoolsV2/components/PositionCard'
import { useAccount } from 'wagmi'

const PoolDetailsPage = <T extends PoolType>({ poolType, address }: { poolType: T; address: Address }) => {
  const { t } = useTranslation()
  const { poolsData } = usePools({ poolTypes: [poolType], addresses: [address] }, { paused: !poolType || !address })

  const isUnknownPool = poolsData && poolsData.length === 0
  /**
   * undefined: loading
   * null: unknown pool
   * PoolParsed: known pool
   */
  const poolData = !poolsData ? undefined : isUnknownPool ? null : poolsData[0]

  return (
    <Page
      title={t('Pools') + (poolData ? `(${poolData.type}) ${poolData.token0.symbol}-${poolData.token1.symbol}` : '')}
      image="/images/og-images/pools.jpeg"
      className="w-full"
    >
      <div className="flex flex-col xs:flex-row xs:justify-between">
        {!!poolType && (
          <BreadscrumbsV2
            items={[
              {
                label: `Dashboard (${poolType.toUpperCase()})`,
                link: `/dashboard/${poolType}`,
              },
              {
                label: 'Pools',
                link: `/dashboard/${poolType}#pools`,
              },
              {
                label: !poolData
                  ? !address
                    ? '-'
                    : `${address.slice(0, 6)}...${address.slice(-4)}`
                  : `${poolData.token0.symbol} / ${poolData.token1.symbol}`,
              },
            ]}
          />
        )}
        {poolData && (
          <ExternalLink className="mt-4 xs:mt-0" href={getBlockExploreLink(address, 'address')}>
            {t('View on {{site}}', { site: getBlockExploreName() })}
          </ExternalLink>
        )}
      </div>

      <div className="mt-8 flex flex-col xs:flex-row">
        {isUnknownPool ? (
          <div>
            <h1>{t('Unknown Pool')}</h1>
            <p>{t('This pool is not available in the current version of the app.')}</p>
          </div>
        ) : !poolData ? (
          // TODO: we can add skeleton loader here
          <div className="h-[250px] md:h-[300px] w-full flex items-center justify-center">
            <Spinner />
          </div>
        ) : (
          <div className="w-full">
            <div className="flex flex-col md:flex-row justify-between items-start">
              <div>
                <div className="flex items-center space-x-4">
                  <CurrencyLogoWithSymbol
                    addressA={poolData.token0.id}
                    addressB={poolData.token1.id}
                    symbol={`${poolData.token0.symbol} / ${poolData.token1.symbol}`}
                    symbolClassName="text-2xl font-bold"
                  />
                  <div className="flex items-center space-x-2">
                    <TagV2 color="default">{poolData.type.toUpperCase()}</TagV2>
                    {poolData.type === 'v3' && (
                      <TagV2 color="green">
                        {(+(poolData as PoolV3Parsed).feeTier / 1000000).toLocaleString(undefined, {
                          style: 'percent',
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </TagV2>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex flex-1 flex-col s:flex-row space-y-2 s:space-y-0 s:space-x-4">
                  <div className="flex space-x-1 items-center">
                    <CurrencyLogoWithSymbol
                      addressA={poolData.token0.id}
                      symbol={`1 ${poolData.token0.symbol} =`}
                      symbolClassName="text-sm font-normal"
                    />
                    <TokenRate
                      rate={poolData.price}
                      className="text-sm font-normal leading-none"
                      hiddenDigitClassName="text-[9px] font-normal leading-none"
                    />
                    <span className="text-sm">{poolData.token1.symbol}</span>
                  </div>
                  <div className="flex space-x-1 items-center">
                    <CurrencyLogoWithSymbol
                      addressA={poolData.token1.id}
                      symbol={`1 ${poolData.token1.symbol} =`}
                      symbolClassName="text-sm font-normal"
                    />
                    <TokenRate
                      rate={1 / poolData.price}
                      className="text-sm font-normal leading-none"
                      hiddenDigitClassName="text-[9px] font-normal leading-none"
                    />
                    <span className="text-sm">{poolData.token0.symbol}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 md:mt-0 space-x-3">
                <AddLiquidityButtonV2 poolType={poolType} token0={poolData.token0} token1={poolData.token1} />
                <NextLink
                  href={`/swap?inputCurrency=${unwrapWKAIAAdress(
                    poolData.token0.id,
                  )}&outputCurrency=${unwrapWKAIAAdress(poolData.token1.id)}`}
                >
                  <ButtonV2 variant="subtle" onClick={() => {}}>
                    {t('Trade')}
                  </ButtonV2>
                </NextLink>
              </div>
            </div>

            <div className="mt-6 space-y-6 md:space-y-0 md:flex md:space-x-3">
              <div className="rounded-xl bg-neutral w-full md:w-auto md:min-w-72 p-6 sm:min-h-[400px] space-y-6">
                <div className="space-y-1.5">
                  <h4 className="text-xs">Liquidity</h4>
                  <p className="text-xl font-medium">$ {formatDollarAmount(poolData.tvlUSD.current)}</p>
                  <div>
                    <div className="flex items-center space-x-1">
                      <Percent
                        value={(poolData.tvlUSD['24H'] / (poolData.tvlUSD.current - poolData.tvlUSD['24H'])) * 100}
                      />
                      <span className="text-xs font-normal text-on-surface-subtle">(24H)</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Percent
                        value={(poolData.tvlUSD['7D'] / (poolData.tvlUSD.current - poolData.tvlUSD['7D'])) * 100}
                      />
                      <span className="text-xs font-normal text-on-surface-subtle">(7D)</span>
                    </div>
                  </div>
                  <div className="max-w-screen-xs">
                    <div className="mt-4 flex justify-between">
                      <CurrencyLogoWithSymbol
                        addressA={poolData.token0.id}
                        logoSize={20}
                        symbol={poolData.token0.symbol}
                        symbolClassName="text-sm font-normal"
                      />
                      <span>{formatAmount(poolData.reserve0)}</span>
                    </div>
                    <div className="mt-1 flex justify-between">
                      <CurrencyLogoWithSymbol
                        addressA={poolData.token1.id}
                        logoSize={20}
                        symbol={poolData.token1.symbol}
                        symbolClassName="text-sm font-normal"
                      />
                      <span>{formatAmount(poolData.reserve1)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between space-x-4">
                  <div className="space-y-1.5 flex-1">
                    <h4 className="text-xs">{t('Volume 24H')}</h4>
                    <p className="text-xl font-medium">$ {formatDollarAmount(poolData.volumeUSD['24H'])}</p>
                  </div>
                  <div className="space-y-1.5 flex-1">
                    <h4 className="text-xs">{t('Volume 7D')}</h4>
                    <p className="text-xl font-medium">$ {formatDollarAmount(poolData.volumeUSD['7D'])}</p>
                  </div>
                </div>
                <div className="flex justify-between">
                  <div className="space-y-1.5 flex-1">
                    <h4 className="text-xs">{t('APY 24H')}</h4>
                    <p className="text-xl font-medium text-emerald-400">
                      {poolData.apy['24H']
                        ? poolData.apy['24H'].toLocaleString(undefined, {
                            style: 'percent',
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })
                        : '-'}
                    </p>
                  </div>
                  <div className="space-y-1.5 flex-1">
                    <h4 className="text-xs">{t('APY 7D')}</h4>
                    <p className="text-xl font-medium text-emerald-400">
                      {poolData.apy['7D']
                        ? poolData.apy['7D'].toLocaleString(undefined, {
                            style: 'percent',
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })
                        : '-'}
                    </p>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <h4 className="text-xs">{t('Total Transactions')}</h4>
                  <p className="text-xl font-medium">{poolData.txCount.total.toLocaleString()}</p>
                  <div>
                    <div className="flex items-center space-x-1">
                      <span className="text-sm text-emerald-400 flex items-center">
                        <ArrowUp />
                        <span>{poolData.txCount['24H'].toLocaleString()}</span>
                      </span>
                      <span className="text-xs font-normal text-on-surface-subtle">(24H)</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-sm text-emerald-400 flex items-center">
                        <ArrowUp />
                        <span>{poolData.txCount['7D'].toLocaleString()}</span>
                      </span>
                      <span className="text-xs font-normal text-on-surface-subtle">(7D)</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-neutral h-80 md:h-auto flex-1 flex items-center justify-center p-6">
                <PoolChart poolType={poolType} address={address} />
              </div>
            </div>

            <div className="mt-6">
              <PoolPositions pool={poolData} />
            </div>
          </div>
        )}
      </div>
    </Page>
  )
}

function PoolPositions({ pool }: { pool: PoolParsed }) {
  const { t } = useTranslation()

  const { address: account } = useAccount()
  const { positions, error } = usePoolPositions({
    account,
    poolType: pool.type,
    poolAddress: pool.id,
  })

  if (error) {
    console.error('Error fetching positions:', error)
    return <></>
  }

  if (!positions || positions.length === 0) {
    return <></>
  }

  return (
    <div>
      <h2>{t('My Positions')}</h2>
      <div className="mt-4 flex flex-col items-center space-y-3">
        {pool.type === 'v2' ? (
          <PoolPositionsV2 pool={pool} position={(positions as PositionV2[])[0]} />
        ) : (
          positions.map((position) => (
            <PoolPositionsV3 key={pool.id} pool={pool as PoolV3Parsed} position={position as PositionV3} />
          ))
        )}
      </div>
    </div>
  )
}

function PoolPositionsV3({ pool, position }: { pool: PoolV3Parsed; position: PositionV3 }) {
  const { prices } = useTokenPrices()
  // use swapscanner price as fallback
  const { prices: ssPrices } = useTokenPrices({ source: 'swapscanner' })

  const priceMap = useMemo(
    () => ({
      ...ssPrices,
      ...prices,
    }),
    [prices, ssPrices],
  )

  const v3Pool = useV3Pool({ poolData: pool })

  return (
    <V3PositionCard
      bgClassName="bg-neutral hover:bg-neutral hover:bg-neutral-900"
      token0={pool.token0}
      token1={pool.token1}
      volume24H={pool.volumeUSD['24H']}
      rewardApr={pool.rewardApr || 0}
      pool={v3Pool}
      position={position}
      priceMap={priceMap}
    />
  )
}

function PoolPositionsV2({
  pool,
  position,
  bgClassName = 'bg-neutral hover:bg-neutral-900',
}: {
  pool: PoolV2Parsed
  position: PositionV2
  bgClassName?: string
}) {
  const { t } = useTranslation()

  const share = position.token0.amount / pool.reserve0
  const shareUSD = share * pool.tvlUSD.current

  return (
    <NextLink
      className={clsx('rounded-xl w-full p-6', bgClassName)}
      href={`/v2/pair/${pool.token0.id}/${pool.token1.id}`}
    >
      <h5>{`${pool.token0.symbol}-${pool.token1.symbol}`}</h5>
      <div className="mt-4 space-x-12">
        <span className="inline-flex flex-col">
          <span className="text-sm">$ {formatDollarAmount(shareUSD)}</span>
          <span className="mt-1 text-xs text-on-surface-subtlest">{t('Value')}</span>
        </span>
        <span className="inline-flex flex-col">
          <span className="text-sm">
            {share.toLocaleString(undefined, {
              style: 'percent',
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
          <span className="mt-1 text-xs text-on-surface-subtlest">{t('Share')}</span>
        </span>
        <span className="inline-flex flex-col space-y-1">
          <span className="inline-flex items-center space-x-1">
            <CurrencyLogoWithSymbol
              logoSize={16}
              addressA={pool.token0.id}
              symbol={pool.token0.symbol}
              symbolClassName="text-xs text-on-surface-subtlest"
            />
            <span className="text-sm">{formatAmount(position.token0.amount)}</span>
          </span>
          <span className="inline-flex items-center space-x-1">
            <CurrencyLogoWithSymbol
              logoSize={16}
              addressA={pool.token1.id}
              symbol={pool.token1.symbol}
              symbolClassName="text-xs text-on-surface-subtlest"
            />
            <span className="text-sm">{formatAmount(position.token1.amount)}</span>
          </span>
        </span>
      </div>
    </NextLink>
  )
}

export default PoolDetailsPage

export const getStaticPaths = getDefaultStaticPaths
export const getStaticProps = getTokenStaticProps
