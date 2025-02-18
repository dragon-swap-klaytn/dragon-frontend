import { Transition } from '@headlessui/react'
import { CurrencyLogoWithSymbol, ExternalLink, TagV2 } from '@pancakeswap/uikit'
import { CaretRight } from '@phosphor-icons/react'
import clsx from 'clsx'
import { PortfolioV3DataBigInt } from 'hooks/use-portfolio'
import NextLink from 'next/link'
import { PoolParsed, PoolV3Parsed } from 'pages/api/pools'
import { PortfolioV2Data } from 'pages/api/portfolio'
import { useMemo, useState } from 'react'
import { getBlockExploreLink, getBlockExploreName } from 'utils'
import getPercentage from 'utils/getPercentage'
import PositionCardList from 'views/Dashboard/components/PoolTable/PositionCard'
import { feeTierPercent } from 'views/Dashboard/utils'
import { formatDollarAmount } from 'views/Dashboard/utils/numbers'

export const PoolDataRowSkeleton = ({
  isLastIndex,
  hide7DColumn,
}: {
  isLastIndex?: boolean
  hide7DColumn?: boolean
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
            <div className="w-8 h-6 bg-neutral rounded-full animate-pulse" />
            <div className="w-8 h-6 bg-neutral rounded-full animate-pulse" />
          </div>
        </div>
      </td>
      {/* APY24H */}
      <td className="text-on-surface px-4 py-6 text-left hidden sm:table-cell space-x-2">
        <div className="w-12 h-6 bg-neutral rounded-full animate-pulse" />
      </td>
      {/* APY7D */}
      <td
        className={clsx('text-on-surface px-4 py-6 text-left hidden', {
          'md:table-cell': !hide7DColumn,
        })}
      >
        <div className="w-12 h-6 bg-neutral rounded-full animate-pulse" />
      </td>
      {/* TVL */}
      <td className="text-on-surface px-4 py-6 text-left">
        <div className="w-12 h-6 bg-neutral rounded-full animate-pulse" />
      </td>
      {/* Volume24H */}
      <td className="text-on-surface px-4 py-6 text-left">
        <div className="w-12 h-6 bg-neutral rounded-full animate-pulse" />
      </td>
      {/* Volume7D */}
      <td
        className={clsx('text-on-surface px-4 py-6 text-left hidden', {
          'md:table-cell': !hide7DColumn,
        })}
      >
        <div className="w-12 h-6 bg-neutral rounded-full animate-pulse" />
      </td>
      <td className="text-on-surface px-4 py-6 text-left">
        <CaretRight size={16} />
      </td>
    </tr>
  )
}

// TODO: @daniel change farm prop to positions[]
export const PoolDataRow = ({
  poolData,
  userData,
  isLastIndex,
  hide7DColumn,
}: {
  poolData: PoolParsed
  userData?: PortfolioV3DataBigInt | PortfolioV2Data
  isLastIndex: boolean
  hide7DColumn?: boolean
}) => {
  const [showUserData, setShowUserData] = useState(false)
  const poolSymbol = useMemo(
    () => `${poolData.token0.symbol}/${poolData.token1.symbol}`,
    [poolData.token0.symbol, poolData.token1.symbol],
  )

  const isBoosted = (poolData as PoolV3Parsed).rewardApr && (poolData as PoolV3Parsed).rewardApr > 0

  return (
    <>
      <tr
        className={clsx('bg-surface-raised text-sm cursor-pointer', {
          'border-b border-border': !isLastIndex,
        })}
        onClick={() => setShowUserData(!showUserData)}
      >
        <td className="text-on-surface px-4 s:px-6 py-6 text-left">
          <div className="flex flex-col s:flex-row items-start s:items-center gap-2 sm">
            <NextLink
              href={`/pools/${poolData.type}/${poolData.id}`}
              onClick={(e) => e.stopPropagation()}
              className="hover:underline hover:opacity-70"
            >
              <CurrencyLogoWithSymbol
                addressA={poolData.token0.id}
                addressB={poolData.token1.id}
                symbol={poolSymbol}
                spaceX="gap-2"
                flex="flex flex-col items-start gap-2 s:flex-row s:items-center"
              />
            </NextLink>

            <div className="flex flex-wrap items-center gap-2">
              <TagV2 className="min-w-8" color="default">
                {poolData.type.toUpperCase()}
              </TagV2>
              {'feeTier' in poolData && (
                <TagV2 className="min-w-8" color="green">
                  {feeTierPercent(poolData.feeTier)}
                </TagV2>
              )}
              {isBoosted && (
                <TagV2 className="min-w-8" color="orange">
                  Boost 🔥
                </TagV2>
              )}

              {/* TODO: remove zzz @kay */}
              {userData ? <>zzz</> : <></>}
            </div>
          </div>
        </td>
        <td className="text-on-surface px-4 py-6 text-left hidden sm:table-cell space-x-2">
          {isBoosted ? (
            <>
              <span className="text-brand">
                {getPercentage(poolData.apy['24H'] + ((poolData as any).rewardApr ?? 0))}
              </span>
              <span className="line-through text-gray-500">{getPercentage(poolData.apy['24H'])}</span>
            </>
          ) : (
            <>{getPercentage(poolData.apy['24H'])}</>
          )}
        </td>
        <td
          className={clsx('text-on-surface px-4 py-6 text-left hidden', {
            'md:table-cell': !hide7DColumn,
          })}
        >
          {getPercentage(poolData.apy['7D'] + ((poolData as any).rewardApr ?? 0))}
        </td>
        <td className="text-on-surface px-4 py-6 text-left">
          <span>{formatDollarAmount(poolData.tvlUSD.current)}</span>
        </td>
        <td className="text-on-surface px-4 py-6 text-left">
          <span>{formatDollarAmount(poolData.volumeUSD['24H'])}</span>
        </td>
        <td
          className={clsx('text-on-surface px-4 py-6 text-left hidden', {
            'md:table-cell': !hide7DColumn,
          })}
        >
          {formatDollarAmount(poolData.volumeUSD['7D'])}
        </td>
        <td className="text-on-surface px-4 py-6 text-left">
          <CaretRight size={16} className={clsx({ 'rotate-90': showUserData })} />
        </td>
      </tr>

      {userData ? (
        <Transition
          as="tr"
          show={showUserData}
          enter="transition-opacity duration-100"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <td className="bg-neutral" colSpan={6}>
            <div className="grid grid-cols-6 p-5 gap-10">
              <div className="col-span-1">
                <h4 className="text-sm text-on-surface">{poolSymbol}</h4>

                <ExternalLink href={getBlockExploreLink(poolData.id, 'token')} className="text-[13px]">
                  {getBlockExploreName()}
                </ExternalLink>
              </div>

              <PositionCardList
                className="col-span-5"
                token0={poolData.token0}
                token1={poolData.token1}
                userData={userData}
                poolFeeTier={+(poolData as PoolV3Parsed).feeTier}
              />
            </div>
          </td>
        </Transition>
      ) : (
        <></>
      )}
    </>
  )
}
