import { Address } from 'viem'
import { SupportedChainId } from './constants/supportedChains'
import { ContractAddresses } from './type'

export const galetoOracleETH: Record<string, Address> = {} as const satisfies ContractAddresses<SupportedChainId>
