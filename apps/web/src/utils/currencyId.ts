import { Currency } from '@pancakeswap/sdk'

export function currencyId(currency?: Currency): string {
  if (currency?.isNative) return currency.symbol?.toUpperCase()
  if (currency && (currency?.isToken || 'address' in currency)) return currency.address
  throw new Error('invalid currency')
}

export default currencyId
