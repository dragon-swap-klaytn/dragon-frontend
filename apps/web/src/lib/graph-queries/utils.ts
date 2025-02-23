import { tokensToBeOverridden } from 'lib/graph-queries/const'
import { TokenSimple } from 'lib/graph-queries/types'

export const overrideToken = (token: TokenSimple): TokenSimple => {
  const overrides = tokensToBeOverridden[token.id]

  if (!overrides) {
    return {
      id: token.id,
      decimals: +token.decimals,
      symbol: token.symbol,
      name: token.name,
    }
  }

  return {
    id: token.id,
    decimals: +token.decimals,
    symbol: overrides.symbol ? overrides.symbol(token.symbol) : token.symbol,
    name: overrides.name ? overrides.name(token.name) : token.name,
  }
}
