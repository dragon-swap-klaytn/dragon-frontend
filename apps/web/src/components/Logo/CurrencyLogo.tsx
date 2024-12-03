import { ChainId } from '@pancakeswap/chains'
import { useHttpLocations } from '@pancakeswap/hooks'
import { Currency } from '@pancakeswap/sdk'
import { WrappedTokenInfo } from '@pancakeswap/token-lists'
import { BinanceIcon, TokenLogo } from '@pancakeswap/uikit'
import { getTokenLogoFromSs } from '@pancakeswap/widgets-internal'
import { ASSET_CDN } from 'config/constants/endpoints'
import { useMemo } from 'react'
import { styled } from 'styled-components'
import getTokenLogoURL from '../../utils/getTokenLogoURL'

const StyledLogo = styled(TokenLogo)<{ size: string }>`
  width: ${({ size }) => size};
  height: ${({ size }) => size};
  border-radius: 50%;
`

interface LogoProps {
  currency?: Currency
  size?: string
  style?: React.CSSProperties
}

export function FiatLogo({ currency, size = '24px', style }: LogoProps) {
  return (
    <StyledLogo
      size={size}
      srcs={[`/images/currencies/${currency?.symbol?.toLowerCase()}.png`]}
      width={size}
      style={style}
    />
  )
}

export default function CurrencyLogo({ currency, size = '24px', style }: LogoProps) {
  const uriLocations = useHttpLocations(currency instanceof WrappedTokenInfo ? currency.logoURI : undefined)

  const srcs: string[] = useMemo(() => {
    if (currency?.isNative) return []

    if (currency?.isToken) {
      const tokenLogoFromSs = getTokenLogoFromSs(currency.wrapped)
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

  if (currency?.isNative) {
    if (currency.chainId === ChainId.BSC) {
      return <BinanceIcon width={size} style={style} />
    }
    if (currency.chainId === ChainId.KLAYTN) {
      return (
        <StyledLogo
          size={size}
          srcs={['https://cdn.prod.website-files.com/666642b50954b5d26bc84836/6667a85f241d5c033f976181_KAIA%20256.png']}
          width={size}
          style={style}
        />
      )
    }
    return (
      <StyledLogo size={size} srcs={[`${ASSET_CDN}/web/native/${currency.chainId}.png`]} width={size} style={style} />
    )
  }

  return <StyledLogo size={size} srcs={srcs} alt={`${currency?.symbol ?? 'token'} logo`} style={style} />
}
