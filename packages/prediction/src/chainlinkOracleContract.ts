import { ChainId } from '@pancakeswap/chains'
import { Address } from 'viem'
import { SupportedChainId } from './constants/supportedChains'
import { ContractAddresses } from './type'

export const chainlinkOracleBNB: Record<string, Address> = {
  [ChainId.KLAYTN]: '0x',
} as const satisfies ContractAddresses<SupportedChainId>

export const chainlinkOracleCAKE: Record<string, Address> = {
  [ChainId.KLAYTN]: '0x',
} as const satisfies ContractAddresses<SupportedChainId>

export const chainlinkOracleKLAY: Record<string, Address> = {
  [ChainId.KLAYTN]: '0x16937CFc59A8Cd126Dc70A75A4bd3b78f690C861',
} as const satisfies ContractAddresses<SupportedChainId>
