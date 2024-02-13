import { ChainId } from '@pancakeswap/chains'
import { WETH9 } from '@pancakeswap/sdk'
import { USDT } from './common'

export const klaytnTestnetTokens = {
  weth: WETH9[ChainId.KLAYTN_TESTNET],
  usdt: USDT[ChainId.KLAYTN_TESTNET],
}
