import { ChainId } from '@pancakeswap/chains'

const DISTRIBUTOR_ADDRESS = '0x' as const

export const DISTRIBUTOR_ADDRESSES = {
  [ChainId.KLAYTN]: DISTRIBUTOR_ADDRESS,
  [ChainId.KLAYTN_TESTNET]: DISTRIBUTOR_ADDRESS,
}
