import { ChainId } from '@pancakeswap/sdk'
import { Address } from 'viem'

import { ProfileSupportedChainId, SupportedChainId } from './supportedChains'

export type ContractAddresses<T extends ChainId = SupportedChainId> = {
  [chainId in T]: Address
}

export const ICAKE = {
  [ChainId.KLAYTN]: '0x',
  [ChainId.KLAYTN_TESTNET]: '0x',
} as const satisfies ContractAddresses<SupportedChainId>

// Used to send cross chain message
// Name derived from smart contract
export const INFO_SENDER = {
  [ChainId.KLAYTN]: '0x',
  [ChainId.KLAYTN_TESTNET]: '0x',
} as const satisfies ContractAddresses<ProfileSupportedChainId>
