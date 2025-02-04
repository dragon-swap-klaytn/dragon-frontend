import { Price, Token } from '@pancakeswap/sdk'
import { Bound } from 'config/constants/types'
import { formatPrice } from 'utils/formatCurrencyAmount'

export function formatTickPrice(
  price: Price<Token, Token> | undefined,
  atLimit: { [bound in Bound]?: boolean | undefined },
  direction: Bound,
  locale: string,
  placeholder?: string,
) {
  if (atLimit[direction]) {
    return direction === Bound.LOWER ? '0' : '∞'
  }

  if (!price && placeholder !== undefined) {
    return placeholder
  }

  if (price?.greaterThan(1e15)) {
    return '∞'
  }

  return formatPrice(price, 6, locale)
}
