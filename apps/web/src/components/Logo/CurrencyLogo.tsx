import { useHttpLocations } from '@pancakeswap/hooks'
import { Currency } from '@pancakeswap/sdk'
import { WrappedTokenInfo } from '@pancakeswap/token-lists'
import { TokenLogo, ZERO_ADDRESS } from '@pancakeswap/uikit'
import getTokenIconSrcFromSs from '@pancakeswap/utils/getTokenIconSrcFromSs'
import clsx from 'clsx'
import { useMemo } from 'react'
import getTokenLogoURL from '../../utils/getTokenLogoURL'

interface LogoProps {
  currency?: Currency
  size?: number
  className?: string
}

export default function CurrencyLogo({ currency, size = 24, className }: LogoProps) {
  const uriLocations = useHttpLocations(currency instanceof WrappedTokenInfo ? currency.logoURI : undefined)

  const srcs: string[] = useMemo(() => {
    if (currency?.isNative) return [getTokenIconSrcFromSs(ZERO_ADDRESS) as string]

    if (currency?.isToken) {
      const tokenLogoFromSs = getTokenIconSrcFromSs(currency?.wrapped?.address)
      if (tokenLogoFromSs) {
        return [tokenLogoFromSs]
      }

      const tokenLogoURL = getTokenLogoURL(currency)

      if (currency instanceof WrappedTokenInfo) {
        if (!tokenLogoURL) return [...uriLocations]
        return [...uriLocations, tokenLogoURL]
      }
      if (!tokenLogoURL) return []
      return [tokenLogoURL]
    }
    return []
  }, [currency, uriLocations])

  return (
    <div
      className={clsx('rounded-full shrink-0 overflow-hidden', size, className)}
      style={{
        width: size,
        height: size,
      }}
    >
      <TokenLogo srcs={srcs} alt={`${currency?.symbol ?? 'token'} logo`} />
    </div>
  )
}
