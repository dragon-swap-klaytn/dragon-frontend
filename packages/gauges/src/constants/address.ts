import { ChainId } from '@pancakeswap/chains'

export const GAUGES = '0x' as const
export const GAUGES_TESTNET = '0x' as const

export const GAUGES_ADDRESS = {
  [ChainId.KLAYTN]: GAUGES,
  [ChainId.KLAYTN_TESTNET]: GAUGES_TESTNET,
}

export const GAUGES_CALC_ADDRESS = {
  [ChainId.KLAYTN]: '0x' as const,
  [ChainId.KLAYTN_TESTNET]: '0x' as const,
}
