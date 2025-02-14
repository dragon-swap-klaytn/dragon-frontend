import { CurrencyLogoWithSymbol } from '@pancakeswap/uikit'
import clsx from 'clsx'
import { TokenDetailed } from 'tokens/get-cached-token-stats'
import Percent from 'views/Dashboard/components/Percent'
import { formatDollarAmount } from 'views/Dashboard/utils/numbers'

export const TokenDataRowSkeleton = ({ isLastIndex }: { isLastIndex: boolean }) => {
  return (
    <tr
      className={clsx('bg-surface-raised text-sm', {
        'border-b border-border': !isLastIndex,
      })}
    >
      <td className="text-on-surface px-4 s:px-6 py-6 text-left">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-surface rounded-full animate-pulse" />
          <div className="w-20 h-4 bg-surface rounded-full animate-pulse" />
        </div>
      </td>
      <td className="text-on-surface px-4 py-6 text-left">
        <div className="w-20 h-4 bg-surface rounded-full animate-pulse" />
      </td>
      <td className="text-on-surface px-4 py-6 text-left">
        <div className="w-20 h-4 bg-surface rounded-full animate-pulse" />
      </td>
      <td className="text-on-surface px-4 py-6 text-left">
        <div className="w-20 h-4 bg-surface rounded-full animate-pulse" />
      </td>
      <td className="text-on-surface px-4 py-6 text-left">
        <div className="w-20 h-4 bg-surface rounded-full animate-pulse" />
      </td>
      <td className="text-on-surface px-4 py-6 text-left">
        <div className="w-20 h-4 bg-surface rounded-full animate-pulse" />
      </td>
      <td className="text-on-surface px-4 py-6 text-left">
        <div className="w-20 h-4 bg-surface rounded-full animate-pulse" />
      </td>
    </tr>
  )
}

export const TokenDataRow = ({ tokenData, isLastIndex }: { tokenData: TokenDetailed; isLastIndex: boolean }) => {
  return (
    <tr
      className={clsx('bg-surface-raised text-sm', {
        'border-b border-border': !isLastIndex,
      })}
    >
      <td className="text-on-surface px-4 s:px-6 py-6 text-left">
        <div className="flex items-center space-x-2">
          <CurrencyLogoWithSymbol addressA={tokenData.id} symbol={tokenData.symbol} />

          <span className="text-on-surface-subtlest hidden lg:block line-clamp-1">{tokenData.name}</span>
        </div>
      </td>
      <td className="text-on-surface px-4 py-6 text-left">{formatDollarAmount(tokenData.priceUSD.current)}</td>
      <td className="text-on-surface px-4 py-6 text-left">
        <Percent value={(tokenData.priceUSD['24H'] / tokenData.priceUSD.current) * 100} />
      </td>
      <td className="text-on-surface px-4 py-6 text-left hidden md:table-cell">
        <Percent value={(tokenData.priceUSD['7D'] / tokenData.priceUSD.current) * 100} />
      </td>
      <td className="text-on-surface px-4 py-6 text-left hidden s:table-cell">
        {formatDollarAmount(tokenData.volumeUSD['24H'])}
      </td>
      <td className="text-on-surface px-4 py-6 text-left hidden md:table-cell">
        {formatDollarAmount(tokenData.volumeUSD['7D'])}
      </td>
      <td className="text-on-surface px-4 py-6 text-left hidden sm:table-cell">
        {formatDollarAmount(tokenData.tvlUSD.current)}
      </td>
    </tr>
  )
}
