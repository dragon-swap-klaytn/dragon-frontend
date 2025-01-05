import { ChainId } from '@pancakeswap/chains'
import { Address } from 'viem'
import { SupportedChainId } from './constants/supportedChains'
import { ContractAddresses } from './type'

export const predictionsBNB: Record<string, Address> = {
  [ChainId.KLAYTN]: '0x',
} as const satisfies ContractAddresses<SupportedChainId>

export const predictionsCAKE: Record<string, Address> = {
  [ChainId.KLAYTN]: '0x',
} as const satisfies ContractAddresses<SupportedChainId>

export const predictionsETH: Record<string, Address> = {
  [ChainId.KLAYTN]: '0x',
} as const satisfies ContractAddresses<SupportedChainId>
