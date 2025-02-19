import { Currency, CurrencyAmount, Token } from '@pancakeswap/swap-sdk-core'
import { getAddress } from 'viem'

export const toChecksumCurrencyAmount = (currencyAmount: CurrencyAmount<Currency>) => {
  const { currency } = currencyAmount

  if (currency.isNative) {
    return currencyAmount
  }

  return CurrencyAmount.fromFractionalAmount(
    new Token(currency.chainId, getAddress(currency.address), currency.decimals, currency.symbol),
    currencyAmount.numerator,
    currencyAmount.denominator,
  )
}
