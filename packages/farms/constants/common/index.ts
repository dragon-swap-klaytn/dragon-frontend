import { ChainId } from '@pancakeswap/chains'
import { ERC20Token } from '@pancakeswap/sdk'
import type { FarmV3SupportedChainId } from '../../src'
import type { CommonPrice } from '../../src/fetchFarmsV3'

export const CAKE_BNB_LP_MAINNET = '0x0eD7e52944161450477ee417DE9Cd3a859b14fD0'

export type PriceHelper = {
  chain: string
  list: ERC20Token[]
}

// DEV_NOTE [체인설정]_6 : 기축통화 설정
export const priceHelperTokens = {
  [ChainId.KLAYTN]: {
    chain: 'klaytn',
    list: [],
  },
} satisfies Record<number, PriceHelper>

// for testing purposes
export const DEFAULT_COMMON_PRICE: Record<FarmV3SupportedChainId, CommonPrice> = {
  [ChainId.KLAYTN]: {},
  [ChainId.KLAYTN_TESTNET]: {},
}
