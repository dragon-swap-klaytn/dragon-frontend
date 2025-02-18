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
      <td className="text-on-surface px-4 py-6 text-left hidden md:table-cell">
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
      <td className="text-on-surface px-4 py-6 text-left hidden md:table-cell">
        <div className="w-12 h-6 bg-neutral rounded-full animate-pulse" />
      </td>
      {openable && (
        <td className="text-on-surface px-4 py-6 text-left">
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
  userData,
  isLastIndex,
  openable = false,
}: {
  poolData: PoolParsed
  userData?: PortfolioV3DataBigInt | PortfolioV2Data
  isLastIndex: boolean
  openable?: boolean
}) => {
  const [showUserData, setShowUserData] = useState(false)
  const poolSymbol = useMemo(
    () => `${poolData.token0.symbol}/${poolData.token1.symbol}`,
    [poolData.token0.symbol, poolData.token1.symbol],
  )

  const isBoosted = !!(poolData as PoolV3Parsed).rewardApr && (poolData as PoolV3Parsed).rewardApr > 0

  return (
    <>
      <tr
        className={clsx('bg-surface-raised text-sm', {
          'border-b border-border': !isLastIndex,
          'cursor-pointer': openable,
        })}
        onClick={() => {
          if (openable) setShowUserData((p) => !p)
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
                    <span className="mr-1 hidden sm:block">Boost</span>
                    <span>🔥</span>
                  </TagV2>
                </div>
              )}

              {/* TODO: remove zzz @kay */}
              {userData ? <>zzz</> : <></>}
            </div>
          </div>
        </td>
        <td className="text-on-surface px-4 py-6 text-left">
          <APRWithBoost lpApr={poolData.apy['24H']} rewardApr={(poolData as any).rewardApr} isBoosted={isBoosted} />
        </td>
        <td className="text-on-surface px-4 py-6 text-left hidden lg:table-cell">
          <APRWithBoost lpApr={poolData.apy['7D']} rewardApr={(poolData as any).rewardApr} isBoosted={isBoosted} />
        </td>
        <td className="text-on-surface px-4 py-6 text-left hidden sm:table-cell">
          <span>{formatDollarAmount(poolData.tvlUSD.current)}</span>
        </td>
        <td className="text-on-surface px-4 py-6 text-left hidden s:table-cell">
          <span>{formatDollarAmount(poolData.volumeUSD['24H'])}</span>
        </td>
        <td className="text-on-surface px-4 py-6 text-left hidden lg:table-cell">
          {formatDollarAmount(poolData.volumeUSD['7D'])}
        </td>
        {openable && (
          <td className="text-on-surface pr-4 py-6 text-left">
            <CaretRight size={16} className={clsx({ 'rotate-90': showUserData })} />
          </td>
        )}
      </tr>

      {openable && (
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
          <td className="bg-neutral" colSpan={7}>
            <div className="px-2 sm:px-5 py-5 space-y-5 sm:space-y-0 sm:space-x-10 sm:flex">
              <div className="px-5 sm:px-0 flex sm:flex-col justify-between sm:justify-start">
                <h4 className="text-sm text-on-surface">{poolSymbol}</h4>

                <ExternalLink href={getBlockExploreLink(poolData.id, 'token')} className="text-[13px]">
                  {getBlockExploreName()}
                </ExternalLink>
              </div>

              <PositionCardList
                className="flex-1"
                token0={poolData.token0}
                token1={poolData.token1}
                userData={userData}
                poolFeeTier={+(poolData as PoolV3Parsed).feeTier}
              />
            </div>
          </td>
        </Transition>
      )}
    </>
  )
}
