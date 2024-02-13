import { ChainId } from '@pancakeswap/chains'

// DEV_NOTE [체인설정]_13 : pool 지원 체인 목록
export const SUPPORTED_CHAIN_IDS = [
  ChainId.BSC,
  ChainId.BSC_TESTNET,
  ChainId.ETHEREUM,
  ChainId.KLAYTN,
  ChainId.KLAYTN_TESTNET
] as const

export type SupportedChainId = (typeof SUPPORTED_CHAIN_IDS)[number]

export const CAKE_VAULT_SUPPORTED_CHAINS = [ChainId.BSC, ChainId.BSC_TESTNET] as const

export type CakeVaultSupportedChainId = (typeof CAKE_VAULT_SUPPORTED_CHAINS)[number]
