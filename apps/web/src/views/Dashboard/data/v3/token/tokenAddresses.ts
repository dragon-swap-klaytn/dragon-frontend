import request, { gql } from 'graphql-request'

import { subgraphUrls } from 'lib/graph-queries/const'

const V3_TOKENS_QUERY = gql`
  query topPools {
    tokens(first: 1000, where: { totalValueLockedUSD_gt: 0 }) {
      id
    }
  }
`

interface TokensResponse {
  tokens: {
    id: string
  }[]
}

export default async function fetchAllV3TokenAddresses() {
  try {
    const data = await request<TokensResponse>(subgraphUrls.v3Exchange, V3_TOKENS_QUERY)
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
