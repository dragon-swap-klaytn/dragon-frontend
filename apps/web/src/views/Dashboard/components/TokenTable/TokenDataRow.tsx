import { CurrencyLogoWithSymbol } from '@pancakeswap/uikit'
import clsx from 'clsx'
import NextLink from 'next/link'
import { TokenDetailed } from 'tokens/get-cached-token-stats'
import Percent from 'views/Dashboard/components/Percent'
import { TokenRate } from 'views/Dashboard/components/TokenRate'
import { formatDollarAmountV2 } from 'views/Dashboard/utils/numbers'

export const TokenDataRowSkeleton = ({ isLastIndex }: { isLastIndex?: boolean }) => {
  return (
    <tr
      className={clsx('bg-surface-raised text-sm', {
        'border-b border-border': !isLastIndex,
      })}
    >
      {/* Symbol & Name */}
      <td className="px-4 s:px-6 py-6 text-left">
        <div className="flex items-center space-x-2">
          <CurrencyLogoWithSymbol addressA="dummy" />
          <div className="w-12 h-4 bg-neutral rounded-full animate-pulse" />
          <div className="w-16 h-4 hidden lg:block bg-neutral rounded-full animate-pulse" />
        </div>
      </td>
      {/* Price */}
      <td className="px-4 py-6 text-left">
        <div className="w-10 h-4 bg-neutral rounded-full animate-pulse" />
      </td>
      {/* Price Change 24H */}
      <td className="px-4 py-6 text-left">
        <div className="w-12 h-4 bg-neutral rounded-full animate-pulse" />
      </td>
      {/* Price Change 7D */}
      <td className="px-4 py-6 text-left hidden md:table-cell">
        <div className="w-12 h-4 bg-neutral rounded-full animate-pulse" />
      </td>
      {/* Volume 24H */}
      <td className="px-4 py-6 text-left hidden s:table-cell">
        <div className="w-10 h-4 bg-neutral rounded-full animate-pulse" />
      </td>
      {/* Volume 7D */}
      <td className="px-4 py-6 text-left hidden md:table-cell">
        <div className="w-10 h-4 bg-neutral rounded-full animate-pulse" />
      </td>
      {/* TVL */}
      <td className="px-4 py-6 text-left hidden sm:table-cell">
        <div className="w-10 h-4 bg-neutral rounded-full animate-pulse" />
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
      <td className="px-4 s:px-6 py-6 text-left">
        <div className="flex items-center space-x-2">
          <NextLink href={`/tokens/${tokenData.type}/${tokenData.id}`} className="hover:underline hover:opacity-70">
            <CurrencyLogoWithSymbol addressA={tokenData.id} symbol={tokenData.symbol} />
          </NextLink>

          <span className="text-on-surface-subtlest hidden lg:block line-clamp-1">{tokenData.name}</span>
        </div>
      </td>
      <td className="px-4 py-6 text-left">
        <TokenRate
          prefix="$"
          rate={tokenData.priceUSD.current}
          hiddenDigitClassName="text-[9px] font-normal leading-none"
        />
      </td>
      <td className="px-4 py-6 text-left">
        <Percent value={(tokenData.priceUSD['24H'] / tokenData.priceUSD.current) * 100} />
      </td>
      <td className="px-4 py-6 text-left hidden md:table-cell">
        <Percent value={(tokenData.priceUSD['7D'] / tokenData.priceUSD.current) * 100} />
      </td>
      <td className="px-4 py-6 text-left hidden s:table-cell">
        {formatDollarAmountV2({ num: tokenData.volumeUSD['24H'] })}
      </td>
      <td className="px-4 py-6 text-left hidden md:table-cell">
        {formatDollarAmountV2({ num: tokenData.volumeUSD['7D'] })}
      </td>
      <td className="px-4 py-6 text-left hidden sm:table-cell">
        {formatDollarAmountV2({ num: tokenData.tvlUSD.current })}
      </td>
    </tr>
  )
}
