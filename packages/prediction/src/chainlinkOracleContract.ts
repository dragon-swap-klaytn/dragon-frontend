import { ChainId } from '@pancakeswap/chains'
import { Address } from 'viem'
import { SupportedChainId } from './constants/supportedChains'
import { ContractAddresses } from './type'

export const chainlinkOracleBNB: Record<string, Address> = {
  [ChainId.BSC]: '0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE',
  [ChainId.KLAYTN]: '0x'
} as const satisfies ContractAddresses<SupportedChainId>

export const chainlinkOracleCAKE: Record<string, Address> = {
  [ChainId.BSC]: '0xB6064eD41d4f67e353768aA239cA86f4F73665a1',
  [ChainId.KLAYTN]: '0x'
} as const satisfies ContractAddresses<SupportedChainId>

export const chainlinkOracleKLAY: Record<string, Address> = {
  [ChainId.BSC]: '0x',
  [ChainId.KLAYTN]: '0x16937CFc59A8Cd126Dc70A75A4bd3b78f690C861',
} as const satisfies ContractAddresses<SupportedChainId>
