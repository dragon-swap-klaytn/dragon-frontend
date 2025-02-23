import { Currency, CurrencyAmount, Token } from '@pancakeswap/swap-sdk-core'
import { getAddress } from 'viem'

export const toChecksumCurrencyAmount = (currencyAmount: CurrencyAmount<Currency>) => {
  const { currency } = currencyAmount

  if (currency.isNative) {
    return currencyAmount
  }

  const token = currency as Token

  return CurrencyAmount.fromFractionalAmount(
    new Token(token.chainId, getAddress(token.address), token.decimals, token.symbol),
    currencyAmount.numerator,
    currencyAmount.denominator,
  )
}
