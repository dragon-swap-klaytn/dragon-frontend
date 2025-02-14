import { Currency } from '@pancakeswap/sdk'
import { TokenLogo, ZERO_ADDRESS } from '@pancakeswap/uikit'
import getTokenIconSrc from '@pancakeswap/utils/getTokenIconSrc'
import clsx from 'clsx'
import { useMemo } from 'react'

interface LogoProps {
  currency?: Currency
  size?: number
  className?: string
}

export default function CurrencyLogo({ currency, size = 24, className }: LogoProps) {
  const srcs: string[] = useMemo(() => {
    if (currency?.isNative) return [getTokenIconSrc(ZERO_ADDRESS) as string]

    if (currency?.isToken) {
      const tokenLogoFromSs = getTokenIconSrc(currency?.wrapped?.address)
      if (!tokenLogoFromSs) {
        return []
      }

      return [tokenLogoFromSs]
    }
    return []
  }, [currency])

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
