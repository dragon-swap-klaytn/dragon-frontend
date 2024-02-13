import { ChainId } from '@pancakeswap/chains'
import { Address, Hash } from 'viem'

const FACTORY_ADDRESS = '0x0BFbCF9fa4f9C56B0F40a671Ad40E0805A091865'

// DEV_NOTE [체인설정]_7-9 : factory, deployer 등 설정

/**
 * To compute Pool address use DEPLOYER_ADDRESSES instead
 */
export const FACTORY_ADDRESSES = {
  [ChainId.ETHEREUM]: FACTORY_ADDRESS,
  [ChainId.GOERLI]: FACTORY_ADDRESS,
  [ChainId.BSC]: FACTORY_ADDRESS,
  [ChainId.BSC_TESTNET]: FACTORY_ADDRESS,
  [ChainId.KLAYTN]: '0x7431A23897ecA6913D5c81666345D39F27d946A4',
  [ChainId.KLAYTN_TESTNET]: '0x96bF895c1a883cA307EAfFC1DbA5a952af3268BB',
} as const satisfies Record<ChainId, Address>

const DEPLOYER_ADDRESS = '0x41ff9AA7e16B8B1a8a8dc4f0eFacd93D02d071c9'

export const DEPLOYER_ADDRESSES = {
  [ChainId.ETHEREUM]: DEPLOYER_ADDRESS,
  [ChainId.GOERLI]: DEPLOYER_ADDRESS,
  [ChainId.BSC]: DEPLOYER_ADDRESS,
  [ChainId.BSC_TESTNET]: DEPLOYER_ADDRESS,
  [ChainId.KLAYTN]: '0x76d724e959D3013b5BB7d2593eb5121Ac004FF17',
  [ChainId.KLAYTN_TESTNET]: '0x02117F3E6fAFdB24FD2DCe397A712C559405997B',
} as const satisfies Record<ChainId, Address>

export const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000'

const POOL_INIT_CODE_HASH = '0x6ce8eb472fa82df5469c6ab6d485f17c3ad13c8cd7af59b3d4a8026c5ce0f7e2'
const POOL_INIT_CODE_HASH_KLAY = '0x2b1d8d8c1b720779a6233ba470422ae0cb55ef3c96f3be1b9533ff08b8f542c6'

export const POOL_INIT_CODE_HASHES = {
  [ChainId.ETHEREUM]: POOL_INIT_CODE_HASH,
  [ChainId.GOERLI]: POOL_INIT_CODE_HASH,
  [ChainId.BSC]: POOL_INIT_CODE_HASH,
  [ChainId.BSC_TESTNET]: POOL_INIT_CODE_HASH,
  [ChainId.KLAYTN]: POOL_INIT_CODE_HASH_KLAY,
  [ChainId.KLAYTN_TESTNET]: POOL_INIT_CODE_HASH_KLAY,
} as const satisfies Record<ChainId, Hash>

/**
 * The default factory enabled fee amounts, denominated in hundredths of bips.
 */
export enum FeeAmount {
  LOWEST = 100,
  LOW = 500,
  MEDIUMLOW = 1000,
  MEDIUM = 2000,
  HIGH = 5000,
  HIGHEST = 10000
}

/**
 * The default factory tick spacings by fee amount.
 */
export const TICK_SPACINGS: { [amount in FeeAmount]: number } = {
  [FeeAmount.LOWEST]: 1,
  [FeeAmount.LOW]: 10,
  [FeeAmount.MEDIUMLOW]: 20,
  [FeeAmount.MEDIUM]: 40,
  [FeeAmount.HIGH]: 100,
  [FeeAmount.HIGHEST]: 200,
}
