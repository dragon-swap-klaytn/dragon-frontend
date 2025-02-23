import request, { gql } from 'graphql-request'
import { subgraphUrls } from 'lib/graph-queries/const'

const TOP_TOKENS_QUERY = gql`
  query topTokens {
    tokens(first: 20, orderBy: volumeUSD, orderDirection: desc) {
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
 * Fetch top addresses by volumeUSD
 */
export default async function fetchTopV3TokenAddresses() {
  try {
    const data = await request<TopTokensResponse>(subgraphUrls.v3Exchange, TOP_TOKENS_QUERY)

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
