import { Transition } from '@headlessui/react'
import { ButtonV2, CurrencyLogoWithSymbol, ExternalLink, TagV2 } from '@pancakeswap/uikit'
import { CaretRight } from '@phosphor-icons/react'
import clsx from 'clsx'
import { AddLiquidityButtonV2 } from 'components/AddLiquidityButtonV2'

import { Portfolio, PortfolioData, PortfolioV3DataBigInt } from 'hooks/usePortfolio'
import { useTranslation } from 'next-i18next'
import NextLink from 'next/link'
import { PoolParsed, PoolV3Parsed } from 'pages/api/pools'
import { useMemo, useState } from 'react'
import { KeyedMutator } from 'swr'
import { getBlockExploreLink, getBlockExploreName } from 'utils'
import getPercentage from 'utils/getPercentage'
import { feeTierPercent } from 'views/Dashboard/utils'
import { formatDollarAmountV2 } from 'views/Dashboard/utils/numbers'
import PositionCardList from 'views/PoolsV2/components/PositionCard'

export const PoolDataRowSkeleton = ({
  isLastIndex,
  openable = false,
}: {
  isLastIndex?: boolean
  openable?: boolean
}) => {
  return (
    <tr
      className={clsx('bg-surface-raised text-sm', {
        'border-b border-border': !isLastIndex,
      })}
    >
      <td className="text-on-surface px-4 s:px-6 py-6 text-left">
        <div className="flex flex-col s:flex-row items-start s:items-center gap-2 sm">
          <CurrencyLogoWithSymbol
            addressA="dummy"
            addressB="dummy"
            spaceX="gap-2"
            flex="flex flex-col items-start gap-2 s:flex-row s:items-center"
          />
          <div className="w-20 h-6 bg-neutral rounded-full animate-pulse" />
          <div className="flex flex-wrap items-center gap-2">
            <div className="w-8 h-6 bg-neutral rounded-full animate-pulse hidden sm:block" />
            <div className="w-8 h-6 bg-neutral rounded-full animate-pulse hidden md:block" />
          </div>
        </div>
      </td>
      {/* APY24H */}
      <td className="text-on-surface px-4 py-6 text-left">
        <div className="w-12 h-6 bg-neutral rounded-full animate-pulse" />
      </td>
      {/* APY7D */}
      <td className="text-on-surface px-4 py-6 text-left hidden lg:table-cell">
        <div className="w-12 h-6 bg-neutral rounded-full animate-pulse" />
      </td>
      {/* TVL */}
      <td className="text-on-surface px-4 py-6 text-left hidden sm:table-cell">
        <div className="w-12 h-6 bg-neutral rounded-full animate-pulse" />
      </td>
      {/* Volume24H */}
      <td className="text-on-surface px-4 py-6 text-left hidden s:table-cell">
        <div className="w-12 h-6 bg-neutral rounded-full animate-pulse" />
      </td>
      {/* Volume7D */}
      <td className="text-on-surface px-4 py-6 text-left hidden lg:table-cell">
        <div className="w-12 h-6 bg-neutral rounded-full animate-pulse" />
      </td>
      {openable && (
        <td className="text-on-surface pr-4 py-6 text-left">
          <CaretRight size={16} />
        </td>
      )}
    </tr>
  )
}

const APRWithBoost = ({ lpApr, rewardApr, isBoosted }: { lpApr: number; rewardApr?: number; isBoosted?: boolean }) => {
  return (
    <>
      {isBoosted ? (
        <div className="space-x-2">
          <span className="text-brand">{getPercentage(lpApr + (rewardApr ?? 0))}</span>
          <span className="line-through text-gray-500 hidden md:inline">{getPercentage(lpApr)}</span>
        </div>
      ) : (
        <>{getPercentage(lpApr)}</>
      )}
    </>
  )
}

// TODO: @daniel change farm prop to positions[]
export const PoolDataRow = ({
  poolData,
  portfolioData,
  mutatePortfolio,
  isLastIndex,
  openable = false,
}: {
  poolData: PoolParsed
  portfolioData?: PortfolioData
  mutatePortfolio?: KeyedMutator<Portfolio>
  isLastIndex: boolean
  openable?: boolean
}) => {
  const { t } = useTranslation()
  const [showPortfolioData, setShowPortfolioData] = useState(false)

  const poolSymbol = useMemo(
    () => `${poolData.token0.symbol}/${poolData.token1.symbol}`,
    [poolData.token0.symbol, poolData.token1.symbol],
  )

  const isBoosted = !!(poolData as PoolV3Parsed).rewardApr && (poolData as PoolV3Parsed).rewardApr > 0
  const containsOutOfBounds =
    (portfolioData as PortfolioV3DataBigInt)?.positions &&
    (portfolioData as PortfolioV3DataBigInt).positions.some((p) => p.isOutOfBounds)
  const isMyPool = !!portfolioData

  return (
    <>
      <tr
        className={clsx('bg-surface-raised text-sm', {
          'border-b border-border': !isLastIndex,
          'cursor-pointer': openable,
        })}
        onClick={() => {
          if (openable) setShowPortfolioData((p) => !p)
        }}
      >
        <td className="text-on-surface px-4 s:px-6 py-6 text-left">
          <div className="flex items-start gap-2">
            <NextLink
              href={`/pools/${poolData.type}/${poolData.id}`}
              onClick={(e) => e.stopPropagation()}
              className="hover:underline hover:opacity-70"
            >
              <CurrencyLogoWithSymbol
                addressA={poolData.token0.id}
                addressB={poolData.token1.id}
                symbol={poolSymbol}
                symbolClassName={
                  containsOutOfBounds ? 'text-red-500 font-bold' : isMyPool ? 'text-blue-500 font-bold' : undefined
                }
                spaceX="gap-2"
                flex="flex items-start gap-2"
              />
            </NextLink>

            <div className="flex flex-wrap items-center gap-2">
              <div className="hidden sm:block">
                <TagV2 className="min-w-8" color="default">
                  {poolData.type.toUpperCase()}
                </TagV2>
              </div>
              {'feeTier' in poolData && (
                <div className="hidden md:block">
                  <TagV2 className="min-w-8" color="green">
                    {feeTierPercent(poolData.feeTier)}
                  </TagV2>
                </div>
              )}
              {isBoosted && (
                <div className="hidden xs:block">
                  <TagV2 className="min-w-8" color="orange">
                    <span className="mr-1 hidden md:block">{t('Boost')}</span>
                    <span>🔥</span>
                  </TagV2>
                </div>
              )}
            </div>
          </div>
        </td>
        <td className="text-on-surface px-4 py-6 text-left">
          {poolData.apy['24H'] === null ? (
            '-'
          ) : (
            <APRWithBoost
              lpApr={poolData.apy['24H']}
              rewardApr={(poolData as PoolV3Parsed).rewardApr}
              isBoosted={isBoosted}
            />
          )}
        </td>
        <td className="text-on-surface px-4 py-6 hidden lg:table-cell text-left">
          {poolData.apy['7D'] === null ? (
            '-'
          ) : (
            <APRWithBoost
              lpApr={poolData.apy['7D']}
              rewardApr={(poolData as PoolV3Parsed).rewardApr}
              isBoosted={isBoosted}
            />
          )}
        </td>
        <td className="text-on-surface px-4 py-6 text-left hidden sm:table-cell">
          <span>
            {formatDollarAmountV2({
              num: poolData.tvlUSD.current,
              withDollarSign: true,
            })}
          </span>
        </td>
        <td
          className={clsx('text-on-surface px-4 py-6 hidden s:table-cell', {
            'text-center': poolData.volumeUSD['24H'] === null,
            'text-left': poolData.volumeUSD['24H'] !== null,
          })}
        >
          <span>
            {poolData.volumeUSD['24H'] === null
              ? '-'
              : formatDollarAmountV2({
                  num: poolData.volumeUSD['24H'],
                  withDollarSign: true,
                })}
          </span>
        </td>
        <td
          className={clsx('text-on-surface px-4 py-6 text-left hidden lg:table-cell', {
            'text-center': poolData.volumeUSD['7D'] === null,
            'text-left': poolData.volumeUSD['7D'] !== null,
          })}
        >
          {poolData.volumeUSD['7D'] === null
            ? '-'
            : formatDollarAmountV2({
                num: poolData.volumeUSD['7D'],
                withDollarSign: true,
              })}
        </td>
        {openable && (
          <td className="text-on-surface pr-4 py-6 text-left">
            <CaretRight
              size={16}
              className={clsx({
                'rotate-90': showPortfolioData,
                'text-blue-500': isMyPool,
                '!text-red-500': containsOutOfBounds,
              })}
            />
          </td>
        )}
      </tr>

      {openable && (
        <Transition
          as="tr"
          show={showPortfolioData}
          enter="transition-opacity duration-100"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <td className="bg-neutral" colSpan={7}>
            <div className="px-2 sm:px-5 py-5 space-y-5 sm:space-y-0 sm:space-x-10 sm:flex">
              <div>
                <div className="px-5 sm:px-0 flex sm:flex-col sm:space-y-1 justify-between sm:justify-start">
                  <NextLink
                    href={`/pools/${poolData.type}/${poolData.id}`}
                    className="text-sm text-on-surface hover:underline hover:opacity-70"
                  >
                    {poolSymbol}
                  </NextLink>

                  <ExternalLink href={getBlockExploreLink(poolData.id, 'token')} className="text-[13px]">
                    {getBlockExploreName()}
                  </ExternalLink>
                </div>

                <div className="mt-5 flex sm:flex-col space-x-3 sm:space-x-0 sm:space-y-3 sm:mt-3">
                  <div className="flex-1">
                    <AddLiquidityButtonV2
                      poolType={poolData.type}
                      feeTier={'feeTier' in poolData ? poolData.feeTier : undefined}
                      token0={poolData.token0}
                      token1={poolData.token1}
                      fullWidth
                    />
                  </div>
                  <div className="flex-1">
                    <NextLink className="w-full" href={`/pools/${poolData.type}/${poolData.id}`}>
                      <ButtonV2 variant="subtle" fullWidth onClick={() => {}}>
                        {t('Pool Details')}
                      </ButtonV2>
                    </NextLink>
                  </div>
                </div>
              </div>

              <PositionCardList
                className="flex-1"
                poolData={poolData}
                portfolioData={portfolioData}
                mutatePositions={mutatePortfolio}
              />
            </div>
          </td>
        </Transition>
      )}
    </>
  )
}
