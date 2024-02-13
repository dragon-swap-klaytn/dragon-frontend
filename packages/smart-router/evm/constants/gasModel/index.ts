import { Token } from '@pancakeswap/sdk'
import { ChainId } from '@pancakeswap/chains'
import {
  ethereumTokens,
  bscTokens,
  bscTestnetTokens,
  goerliTestnetTokens,
  klaytnTokens,
  klaytnTestnetTokens,
} from '@pancakeswap/tokens'

// DEV_NOTE [체인설정]_14 : gas token 지정
export const usdGasTokensByChain = {
  [ChainId.ETHEREUM]: [ethereumTokens.usdt],
  [ChainId.GOERLI]: [goerliTestnetTokens.usdc],
  [ChainId.BSC]: [bscTokens.usdt],
  [ChainId.BSC_TESTNET]: [bscTestnetTokens.usdt],
  [ChainId.KLAYTN]: [klaytnTokens.usdt],
  [ChainId.KLAYTN_TESTNET]: [klaytnTestnetTokens.usdt],
} satisfies Record<ChainId, Token[]>

export * from './v2'
export * from './v3'
export * from './stableSwap'
