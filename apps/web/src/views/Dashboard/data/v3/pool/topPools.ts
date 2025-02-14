import request, { gql } from 'graphql-request'

import isUndefinedOrNull from '@pancakeswap/utils/isUndefinedOrNull'
import { subgraphUrls } from 'lib/graph-queries/const'

export const TOP_POOLS = gql`
  query topPools {
    pools(first: 50, orderBy: totalValueLockedUSD, orderDirection: desc) {
      id
    }
  }
`

interface TopPoolsResponse {
  pools: {
    id: string
  }[]
}

/**
 * Fetch top addresses by volume
 */
export async function fetchTopPoolAddresses() {
  try {
    const data = await request<TopPoolsResponse>(subgraphUrls.v3Exchange, TOP_POOLS)

    const formattedData = data
      ? (data.pools.map((p) => p.id).filter((pool) => !isUndefinedOrNull(pool)) as string[])
      : undefined

    return {
      error: false,
      addresses: formattedData,
    }
  } catch (e) {
    console.error(e)
    return {
      error: false,
      addresses: undefined,
    }
  }
}
