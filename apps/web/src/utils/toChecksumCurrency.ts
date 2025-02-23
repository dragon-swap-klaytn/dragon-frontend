import { Currency, Token } from '@pancakeswap/swap-sdk-core'
import { getAddress } from 'viem'

export const toChecksumCurrency = (token: Currency) => {
  if (token?.isNative) {
    return token
  }

  const _token = token as Token

  return new Token(_token.chainId, getAddress(_token.address), _token.decimals, _token.symbol)
}
