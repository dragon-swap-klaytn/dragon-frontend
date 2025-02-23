import request, { gql } from 'graphql-request'

import isUndefinedOrNull from '@pancakeswap/utils/isUndefinedOrNull'

import { subgraphUrls } from 'lib/graph-queries/const'

export const ALL_POOLS = gql`
  query allPools {
    pools(first: 1000, where: { totalValueLockedUSD_gt: 0 }) {
      id
    }
  }
`

interface AllPoolsResponse {
  pools: {
    id: string
  }[]
}

/**
 * Fetch all addresses by volume
 */
export async function fetchAllPoolAddresses() {
  try {
    const data = await request<AllPoolsResponse>(subgraphUrls.v3Exchange, ALL_POOLS)

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
