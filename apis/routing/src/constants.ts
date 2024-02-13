import { ChainId } from '@pancakeswap/chains'

export const SUPPORTED_CHAINS = [
  ChainId.ETHEREUM,
  ChainId.BSC,
  ChainId.BSC_TESTNET,
  ChainId.GOERLI,
  ChainId.KLAYTN,
  ChainId.KLAYTN_TESTNET,
] as const

export type SupportedChainId = (typeof SUPPORTED_CHAINS)[number]
