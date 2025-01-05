import { ChainId } from '@pancakeswap/chains'
import { Token } from '@pancakeswap/sdk'
import { klaytnTestnetTokens, klaytnTokens } from '@pancakeswap/tokens'

// DEV_NOTE [체인설정]_14 : gas token 지정
export const usdGasTokensByChain = {
  [ChainId.KLAYTN]: [klaytnTokens.usdt],
  [ChainId.KLAYTN_TESTNET]: [klaytnTestnetTokens.usdt],
} satisfies Record<ChainId, Token[]>

export * from './stableSwap'
export * from './v2'
export * from './v3'
