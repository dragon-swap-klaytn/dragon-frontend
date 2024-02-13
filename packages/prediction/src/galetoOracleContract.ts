import { ChainId } from '@pancakeswap/chains'
import { Address } from 'viem'
import { SupportedChainId } from './constants/supportedChains'
import { ContractAddresses } from './type'

export const galetoOracleETH: Record<string, Address> = {
  [ChainId.BSC]: '0x',
} as const satisfies ContractAddresses<SupportedChainId>
