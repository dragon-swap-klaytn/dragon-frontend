import { Token } from '@pancakeswap/swap-sdk-core'
import { getAddress } from 'viem'

export const toChecksumToken = (token: Token) => {
  return new Token(token.chainId, getAddress(token.address), token.decimals, token.symbol)
}
