import { ChainId } from '@pancakeswap/chains'
import { Text } from '@pancakeswap/uikit'
import styled from 'styled-components'
import { chains } from 'utils/wagmi'
import { NetworkLogo, NetworkLogoTheme } from './NetworkLogo'

const SHORT_NAME = {
  [ChainId.BSC]: 'BSC',
  // ATPOS: APT
  [ChainId.ETHEREUM]: 'ETH',
}

const NETWORK_COLOR_DEFAULT = {
  [ChainId.BSC]: '#1E1E1E',
  [ChainId.ETHEREUM]: '#627EEA',
}

const NETWORK_COLOR_COLORED = {
  [ChainId.BSC]: '#F0B90B',
  [ChainId.ETHEREUM]: '#627EEA',
}

const NETWORK_COLOR_PURE_BLACK = '#000000'

const NETWORK_COLOR: Record<NetworkLogoTheme, string | { [chainId: number]: string }> = {
  default: NETWORK_COLOR_DEFAULT,
  colored: NETWORK_COLOR_COLORED,
  'pure-black': NETWORK_COLOR_PURE_BLACK,
}

const SCALE = {
  SM: 'sm',
  MD: 'md',
} as const

type Scale = (typeof SCALE)[keyof typeof SCALE]

const Badge = styled.div.withConfig({ shouldForwardProp: (prop) => prop !== 'scale' })<{ scale?: Scale }>`
  display: inline-flex;
  align-items: center;
  border-radius: ${({ scale }) => (scale === 'sm' ? '12px' : '16px')};
  padding: ${({ scale }) => (scale === 'sm' ? '0 8px 0 2px' : '0 12px 0 8px')};
  height: ${({ scale }) => (scale === 'sm' ? '24px' : '32px')};
  gap: ${({ scale }) => (scale === 'sm' ? '4px' : '8px')};
`

const BadgeText = styled(Text)<{ scale?: Scale }>`
  font-size: ${({ scale }) => (scale === 'sm' ? '14px' : '16px')};
`

export const NetworkBadge: React.FC<{
  color?: NetworkLogoTheme
  chainId?: number
  short?: boolean
  scale?: Scale
}> = ({ color = 'default', chainId, short = true, scale = 'sm' }) => {
  if (!chainId) return null

  const scheme = NETWORK_COLOR[color]

  const bg = typeof scheme === 'string' ? scheme : scheme[chainId]
  const textColor = bg === '#FFFFFF' ? 'black' : 'white'
  const longName = chains.find((c) => c.id === chainId)?.name
  const shortName = SHORT_NAME[chainId]

  return (
    <Badge
      scale={scale}
      style={{
        background: bg,
      }}
    >
      <NetworkLogo type={color} chainId={chainId} />
      <BadgeText color={textColor} bold scale={scale}>
        {short ? shortName : longName}
      </BadgeText>
    </Badge>
  )
}
