import { TokenDetailed } from 'tokens/get-cached-token-stats'

export default function filteringTokensByKey(tokens: TokenDetailed[], key: string) {
  return tokens.filter(
    (token) =>
      token.symbol.toLowerCase().includes(key.toLowerCase()) ||
      token.name.toLowerCase().includes(key.toLowerCase()) ||
      token.id.toLowerCase().includes(key.toLowerCase()),
  )
}
