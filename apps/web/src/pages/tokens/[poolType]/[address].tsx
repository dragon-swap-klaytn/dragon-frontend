import { useTranslation } from '@pancakeswap/localization'
import { BreadscrumbsV2, ButtonV2, CurrencyLogoWithSymbol, ExternalLink, Spinner, TagV2 } from '@pancakeswap/uikit'
import { ArrowUp } from '@phosphor-icons/react'
import { AddLiquidityButtonV2 } from 'components/AddLiquidityButtonV2'
import Page from 'components/Layout/Page'
import NextLink from 'next/link'
import { PoolType } from 'types'
import { getBlockExploreLink, getBlockExploreName } from 'utils'
import { defaultStaticPaths, getTokenStaticProps } from 'utils/pageUtils'
import { unwrapWKAIAAdress } from 'utils/unwrap-wkaia-address'
import { Address } from 'viem'
import Percent from 'views/Dashboard/components/Percent'
import PoolTable from 'views/Dashboard/components/PoolTable'
import { TokenChart } from 'views/Dashboard/components/TokenChart'
import { TokenRate } from 'views/Dashboard/components/TokenRate'
import useTokensData from 'views/Dashboard/hooks/useTokensData'
import { formatDollarAmount } from 'views/Dashboard/utils/numbers'

const TokenDetailsPage = ({ poolType, address }: { poolType: PoolType; address: Address }) => {
  const { t } = useTranslation()
  const { tokensData } = useTokensData({ poolType, addresses: [address] }, { paused: !poolType || !address })

  const isUnknownToken = tokensData && tokensData.length === 0
  /**
   * undefined: loading
   * null: unknown token
   * TokenDetailed: known token
   */
  const tokenData = !tokensData ? undefined : isUnknownToken ? null : tokensData[0]

  return (
    <Page title={tokenData ? tokenData.name : undefined} className="w-full mt-[60px]">
      <div className="flex flex-col xs:flex-row xs:justify-between">
        {!!poolType && (
          <BreadscrumbsV2
            items={[
              {
                label: `Dashboard (${poolType.toUpperCase()})`,
                link: `/dashboard/${poolType}`,
              },
              {
                label: 'Tokens',
                link: `/dashboard/${poolType}#tokens`,
              },
              {
                label: !tokenData
                  ? !address
                    ? '-'
                    : `${address.slice(0, 6)}...${address.slice(-4)}`
                  : tokenData.symbol,
              },
            ]}
          />
        )}
        {tokenData && (
          <ExternalLink className="mt-4 xs:mt-0" href={getBlockExploreLink(address, 'token')}>
            {t('View on {{site}}', { site: getBlockExploreName() })}
          </ExternalLink>
        )}
      </div>

      <div className="mt-8 flex flex-col xs:flex-row">
        {isUnknownToken ? (
          <div>
            <h1>{t('Unknown Token')}</h1>
            <p>{t('This token is not available in the current version of the app.')}</p>
          </div>
        ) : !tokenData ? (
          // TODO: we can add skeleton loader here
          <div className="h-[250px] md:h-[300px] w-full flex items-center justify-center">
            <Spinner />
          </div>
        ) : (
          <div className="w-full">
            <div className="flex flex-col md:flex-row justify-between items-start">
              <div className="flex flex-col">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <CurrencyLogoWithSymbol
                      addressA={tokenData.id}
                      symbol={tokenData.name}
                      symbolClassName="text-xl font-bold"
                    />

                    <span className="text-xl text-on-surface-subtlest">{tokenData.symbol}</span>
                    <TagV2 color="default">{poolType.toUpperCase()}</TagV2>
                  </div>
                </div>

                <span className="mt-3 text-[32px] inline-flex items-center space-x-1">
                  <span>$</span>
                  <TokenRate
                    rate={tokenData.priceUSD.current}
                    className="text-inherit"
                    sigs={4}
                    hiddenDigitsFrom={4}
                    hiddenDigitClassName="text-lg font-normal leading-none"
                  />
                </span>

                <div className="mt-3 flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    <Percent
                      value={
                        (tokenData.priceUSD['24H'] / (tokenData.priceUSD.current - tokenData.priceUSD['24H'])) * 100
                      }
                    />
                    <span className="text-xs font-normal text-on-surface-subtle">(24H)</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Percent
                      value={(tokenData.priceUSD['7D'] / (tokenData.priceUSD.current - tokenData.priceUSD['7D'])) * 100}
                    />
                    <span className="text-xs font-normal text-on-surface-subtle">(7D)</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 md:mt-0 space-x-3">
                <AddLiquidityButtonV2 poolType={poolType} token0={tokenData} />
                <NextLink href={`/swap?outputCurrency=${unwrapWKAIAAdress(tokenData.id)}`}>
                  <ButtonV2 variant="subtle" onClick={() => {}}>
                    {t('Trade')}
                  </ButtonV2>
                </NextLink>
              </div>
            </div>

            <div className="mt-6 space-y-6 md:space-y-0 md:flex md:space-x-3">
              <div className="rounded-xl bg-neutral w-full md:w-auto md:min-w-72 p-6 md:min-h-[320px] space-y-6">
                <div className="space-y-1.5">
                  <h4 className="text-xs">Liquidity</h4>
                  <p className="text-xl font-medium">$ {formatDollarAmount(tokenData.tvlUSD.current)}</p>
                  <div>
                    <div className="flex items-center space-x-1">
                      <Percent
                        value={(tokenData.tvlUSD['24H'] / (tokenData.tvlUSD.current - tokenData.tvlUSD['24H'])) * 100}
                      />
                      <span className="text-xs font-normal text-on-surface-subtle">(24H)</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Percent
                        value={(tokenData.tvlUSD['7D'] / (tokenData.tvlUSD.current - tokenData.tvlUSD['7D'])) * 100}
                      />
                      <span className="text-xs font-normal text-on-surface-subtle">(7D)</span>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between space-x-4">
                  <div className="space-y-1.5 flex-1">
                    <h4 className="text-xs">Volume 24H</h4>
                    <p className="text-xl font-medium">$ {formatDollarAmount(tokenData.volumeUSD['24H'])}</p>
                  </div>
                  <div className="space-y-1.5 flex-1">
                    <h4 className="text-xs">Volume 7D</h4>
                    <p className="text-xl font-medium">$ {formatDollarAmount(tokenData.volumeUSD['7D'])}</p>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <h4 className="text-xs">Total Transactions</h4>
                  <p className="text-xl font-medium">{tokenData.txCount.total.toLocaleString()}</p>
                  <div>
                    <div className="flex items-center space-x-1">
                      <span className="text-sm text-emerald-400 flex items-center">
                        <ArrowUp />
                        <span>{tokenData.txCount['24H'].toLocaleString()}</span>
                      </span>
                      <span className="text-xs font-normal text-on-surface-subtle">(24H)</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-sm text-emerald-400 flex items-center">
                        <ArrowUp />
                        <span>{tokenData.txCount['7D'].toLocaleString()}</span>
                      </span>
                      <span className="text-xs font-normal text-on-surface-subtle">(7D)</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-neutral h-80 md:h-auto flex-1 flex items-center justify-center p-6">
                <TokenChart poolType={poolType} address={address} />
              </div>
            </div>

            <div className="mt-8">
              <h2 className="text-xl">Pools</h2>
              <div className="mt-5">
                <PoolTable poolTypes={poolType ? [poolType] : undefined} tokenAddress={tokenData.id} />
              </div>
            </div>
          </div>
        )}
      </div>
    </Page>
  )
}

export default TokenDetailsPage

export const getStaticPaths = defaultStaticPaths
export const getStaticProps = getTokenStaticProps
