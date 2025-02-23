import request, { gql } from 'graphql-request'
import { subgraphUrls } from 'lib/graph-queries/const'

export const V2_ALL_TOKENS_QUERY = gql`
  query allTokens {
    tokens(first: 1000, where: { totalLiquidity_gt: 0 }) {
      id
    }
  }
`

interface AllTokensResponse {
  tokens: {
    id: string
  }[]
}

export default async function fetchAllV2TokenAddresses() {
  try {
    const data = await request<AllTokensResponse>(subgraphUrls.v2Exchange, V2_ALL_TOKENS_QUERY)

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
