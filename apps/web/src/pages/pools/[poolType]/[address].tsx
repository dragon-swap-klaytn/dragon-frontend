import { useTranslation } from '@pancakeswap/localization'
import { BreadscrumbsV2, ButtonV2, CurrencyLogoWithSymbol, ExternalLink, Spinner } from '@pancakeswap/uikit'
import { ArrowUp } from '@phosphor-icons/react'
import Page from 'components/Layout/Page'
import { GetStaticPaths, GetStaticProps } from 'next'
import { DashboardPoolType } from 'pages/dashboard'
import { getBlockExploreLink, getBlockExploreName } from 'utils'
import { formatAmount } from 'utils/formatInfoNumbers'
import { getTokenStaticPaths, getTokenStaticProps } from 'utils/pageUtils'

import Percent from 'views/Dashboard/components/Percent'
import { PoolChart } from 'views/Dashboard/components/PoolChart'
import { TokenRate } from 'views/Dashboard/components/TokenRate'
import usePools from 'views/Dashboard/hooks/usePools'
import { formatDollarAmount } from 'views/Dashboard/utils/numbers'

const PoolDetailsPage = ({ poolType, address }: { poolType: DashboardPoolType; address: string }) => {
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
    <Page className="w-full">
      <div className="flex flex-col xs:flex-row xs:justify-between">
        <BreadscrumbsV2
          items={[
            {
              label: 'Dashboard',
              link: '/dashboard',
            },
            {
              label: 'Pools',
              link: `/dashboard/${poolType}/pools`,
            },
            {
              label: !poolData
                ? !address
                  ? '-'
                  : address.slice(0, 8)
                : `${poolData.token0.symbol} / ${poolData.token1.symbol}`,
            },
          ]}
        />
        {poolData && (
          <ExternalLink className="mt-4 xs:mt-0" href={getBlockExploreLink(address, 'address')}>
            {t('View on %site%', { site: getBlockExploreName() })}
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
                <CurrencyLogoWithSymbol
                  addressA={poolData.token0.id}
                  addressB={poolData.token1.id}
                  symbol={`${poolData.token0.symbol} / ${poolData.token1.symbol}`}
                  symbolClassName="text-2xl font-bold"
                />

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
                <ButtonV2
                  variant="secondary"
                  onClick={() => {
                    // TODO: Add Liquidity
                  }}
                >
                  {t('Add Liquidity')}
                </ButtonV2>
                <ButtonV2
                  variant="subtle"
                  onClick={() => {
                    // TODO: Trade
                  }}
                >
                  {t('Trade')}
                </ButtonV2>
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
                    <h4 className="text-xs">Volume 24H</h4>
                    <p className="text-xl font-medium">$ {formatDollarAmount(poolData.volumeUSD['24H'])}</p>
                  </div>
                  <div className="space-y-1.5 flex-1">
                    <h4 className="text-xs">Volume 7D</h4>
                    <p className="text-xl font-medium">$ {formatDollarAmount(poolData.volumeUSD['7D'])}</p>
                  </div>
                </div>
                <div className="flex justify-between">
                  <div className="space-y-1.5 flex-1">
                    <h4 className="text-xs">APY 24H</h4>
                    <p className="text-xl font-medium text-emerald-400">
                      {poolData.apy['24H'].toLocaleString(undefined, {
                        style: 'percent',
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                  <div className="space-y-1.5 flex-1">
                    <h4 className="text-xs">APY 7D</h4>
                    <p className="text-xl font-medium text-emerald-400">
                      {poolData.apy['7D'].toLocaleString(undefined, {
                        style: 'percent',
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <h4 className="text-xs">Total Transactions</h4>
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
          </div>
        )}
      </div>
    </Page>
  )
}

PoolDetailsPage.Layout = ({ children }) => <div>{children}</div>
PoolDetailsPage.chains = [] // set all

export default PoolDetailsPage

export const getStaticPaths: GetStaticPaths = getTokenStaticPaths()
export const getStaticProps: GetStaticProps = getTokenStaticProps()
