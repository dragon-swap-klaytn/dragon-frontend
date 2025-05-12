import { TOKEN_MAPPER } from 'const'
import { TokenDetailed } from 'lib/graph-queries/types'
import lowered from 'utils/lowered'

export default function filteringTokensByKey(tokens: TokenDetailed[], key: string) {
  return tokens.filter((token) =>
    [token.symbol, token.name, token.id].some(
      (id) =>
        lowered(id).includes(lowered(key)) ||
        TOKEN_MAPPER[lowered(key)]?.some((t) =>
          [t.symbol, t.name, t.address].some((id2) => lowered(id2).includes(lowered(id))),
        ),
    ),
  )
}
