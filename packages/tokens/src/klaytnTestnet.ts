import { ChainId } from '@pancakeswap/chains'
import { WETH9 } from '@pancakeswap/sdk'
import { CAKE, USDT } from './common'

export const klaytnTestnetTokens = {
  weth: WETH9[ChainId.KLAYTN_TESTNET],
  usdt: USDT[ChainId.KLAYTN_TESTNET],
  cake: CAKE[ChainId.KLAYTN_TESTNET],
}
