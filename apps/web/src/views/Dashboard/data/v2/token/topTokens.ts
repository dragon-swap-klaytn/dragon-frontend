import request, { gql } from 'graphql-request'
import { subgraphUrls } from 'lib/graph-queries/const'

export const TOP_TOKENS_QUERY = gql`
  query topTokens {
    tokens(first: 20, orderBy: tradeVolumeUSD, orderDirection: desc) {
      id
    }
  }
`

interface TopTokensResponse {
  tokens: {
    id: string
  }[]
}

/**
 * Fetch top addresses by tradeVolumeUSD
 */
export async function fetchTopV2TokenAddresses() {
  try {
    const data = await request<TopTokensResponse>(subgraphUrls.v2Exchange, TOP_TOKENS_QUERY)

    return {
      error: false,
      addresses: data ? data.tokens.map((t) => t.id) : undefined,
    }
  } catch (e) {
    return {
      error: true,
      addresses: undefined,
    }
  }
}
