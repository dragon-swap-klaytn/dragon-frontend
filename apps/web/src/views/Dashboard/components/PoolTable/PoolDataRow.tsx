import { CurrencyLogoWithSymbol, TagV2 } from '@pancakeswap/uikit'
import clsx from 'clsx'
import { PoolParsed } from 'pages/api/pools'
import getPercentage from 'utils/getPercentage'
import { feeTierPercent } from 'views/Dashboard/utils'
import { formatDollarAmount } from 'views/Dashboard/utils/numbers'

export const PoolDataRowSkeleton = ({ isLastIndex }: { isLastIndex: boolean }) => {
  return (
    <tr
      className={clsx('bg-surface-raised text-sm', {
        'border-b border-border': !isLastIndex,
      })}
    >
      <td className="text-on-surface px-4 s:px-6 py-6 text-left">
        <div className="flex flex-col s:flex-row items-start s:items-center gap-2 sm">
          <div className="w-6 h-6 bg-surface rounded-full animate-pulse" />
          <div className="w-6 h-6 bg-surface rounded-full animate-pulse" />
        </div>
      </td>
      <td className="text-on-surface px-4 py-6 text-left">
        <div className="bg-surface rounded-full animate-pulse w-16 h-4" />
      </td>
      <td className="text-on-surface px-4 py-6 text-left">
        <div className="bg-surface rounded-full animate-pulse w-16 h-4" />
      </td>
      <td className="text-on-surface px-4 py-6 text-left">
        <div className="bg-surface rounded-full animate-pulse w-16 h-4" />
      </td>
      <td className="text-on-surface px-4 py-6 text-left">
        <div className="bg-surface rounded-full animate-pulse w-16 h-4" />
      </td>
      <td className="text-on-surface px-4 py-6 text-left">
        <div className="bg-surface rounded-full animate-pulse w-16 h-4" />
      </td>
    </tr>
  )
}

export const PoolDataRow = ({ poolData, isLastIndex }: { poolData: PoolParsed; isLastIndex: boolean }) => {
  return (
    <tr
      className={clsx('bg-surface-raised text-sm', {
        'border-b border-border': !isLastIndex,
      })}
    >
      <td className="text-on-surface px-4 s:px-6 py-6 text-left">
        <div className="flex flex-col s:flex-row items-start s:items-center gap-2 sm">
          <CurrencyLogoWithSymbol
            addressA={poolData.token0.id}
            addressB={poolData.token1.id}
            symbol={`${poolData.token0.symbol}/${poolData.token1.symbol}`}
            spaceX="gap-2"
            flex="flex flex-col items-start gap-2 s:flex-row s:items-center"
          />

          {'feeTier' in poolData && <TagV2 color="default">{feeTierPercent(poolData.feeTier)}</TagV2>}
        </div>
      </td>
      <td className="text-on-surface px-4 py-6 text-left">
        <span>{formatDollarAmount(poolData.tvlUSD)}</span>
      </td>
      <td className="text-on-surface px-4 py-6 text-left">
        <span>{formatDollarAmount(poolData.volumeUSD['24H'])}</span>
      </td>
      <td className="text-on-surface px-4 py-6 text-left hidden md:table-cell">
        {formatDollarAmount(poolData.volumeUSD['7D'])}
      </td>
      <td className="text-on-surface px-4 py-6 text-left hidden sm:table-cell">{getPercentage(poolData.apy['24H'])}</td>
      <td className="text-on-surface px-4 py-6 text-left hidden md:table-cell">{getPercentage(poolData.apy['7D'])}</td>
    </tr>
  )
}
