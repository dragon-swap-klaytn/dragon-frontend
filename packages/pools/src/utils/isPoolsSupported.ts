import { ChainId } from '@pancakeswap/chains'

import {
  CAKE_VAULT_SUPPORTED_CHAINS,
  CakeVaultSupportedChainId,
  SUPPORTED_CHAIN_IDS,
  SupportedChainId,
} from '../constants/supportedChains'

export function isPoolsSupported(chainId: number): chainId is SupportedChainId {
  return SUPPORTED_CHAIN_IDS.includes(chainId)
}

export function isCakeVaultSupported(chainId?: ChainId): chainId is CakeVaultSupportedChainId {
  return !!chainId && (CAKE_VAULT_SUPPORTED_CHAINS as readonly ChainId[]).includes(chainId)
}
