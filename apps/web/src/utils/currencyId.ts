import { Currency } from '@pancakeswap/sdk'

export function currencyId(currency?: Currency): string {
  console.log('__currency', currency)
  if (currency?.isNative) return currency.symbol?.toUpperCase()
  if (currency?.isToken) return currency.address
  throw new Error('invalid currency')
}

export default currencyId
