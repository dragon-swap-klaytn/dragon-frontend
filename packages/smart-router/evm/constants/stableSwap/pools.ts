import { ChainId } from '@pancakeswap/chains'
import { StableSwapPool } from './types'

export type StableSwapPoolMap<TChainId extends number> = {
  [chainId in TChainId]: StableSwapPool[]
}

export const isStableSwapSupported = (chainId: number | undefined): chainId is StableSupportedChainId => {
  if (!chainId) {
    return false
  }
  return STABLE_SUPPORTED_CHAIN_IDS.includes(chainId)
}

export const STABLE_SUPPORTED_CHAIN_IDS = [] as ChainId[]

export type StableSupportedChainId = (typeof STABLE_SUPPORTED_CHAIN_IDS)[number]

export const STABLE_POOL_MAP = {
  [ChainId.KLAYTN]: [],
  [ChainId.KLAYTN_TESTNET]: [],
} satisfies StableSwapPoolMap<StableSupportedChainId>
