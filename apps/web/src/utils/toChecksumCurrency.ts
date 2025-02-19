import { Currency, Token } from '@pancakeswap/swap-sdk-core'
import { getAddress } from 'viem'

export const toChecksumCurrency = (token: Currency) => {
  if (token?.isNative) {
    return token
  }

  return new Token(token.chainId, getAddress(token.address), token.decimals, token.symbol)
}
