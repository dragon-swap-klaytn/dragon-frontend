import { ChainId } from '@pancakeswap/chains'
import { supportedChainId } from '@pancakeswap/farms'

export const SUPPORT_ONLY_BSC = [ChainId.BSC]
export const SUPPORT_FARMS = process.env.NEXT_PUBLIC_DISABLE_FARM === '1' ? [] : supportedChainId
export const SUPPORT_BUY_CRYPTO = [
  ChainId.BSC,
  ChainId.ETHEREUM,
]

export const LIQUID_STAKING_SUPPORTED_CHAINS = [
  ChainId.BSC,
  ChainId.ETHEREUM,
  ChainId.BSC_TESTNET,
]
export const FIXED_STAKING_SUPPORTED_CHAINS = [ChainId.BSC]

export const V3_MIGRATION_SUPPORTED_CHAINS = [ChainId.BSC, ChainId.ETHEREUM]

export const SUPPORT_CAKE_STAKING = [ChainId.BSC, ChainId.BSC_TESTNET]
