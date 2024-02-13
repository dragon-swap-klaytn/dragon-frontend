import { ChainId } from '@pancakeswap/chains'
import { ERC20Token, WETH9 } from '@pancakeswap/sdk'
import { USDT } from './common'

export const klaytnTokens = {
  weth: WETH9[ChainId.KLAYTN],
  usdt: USDT[ChainId.KLAYTN],
}
