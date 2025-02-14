import { TOKEN_BLACKLIST } from 'config/constants/info'
import request, { gql } from 'graphql-request'
import { subgraphUrls } from 'lib/graph-queries/const'

/**
 * Data for showing Pools table on the Token page
 */
const POOLS_FOR_TOKEN = () => {
  return gql`
    query poolsForToken($address: String!, $blacklist: [String!]) {
      asToken0: pairs(
        first: 15
        orderBy: trackedReserveETH
        orderDirection: desc
        where: { totalTransactions_gt: 1, token0: $address, token1_not_in: $blacklist }
      ) {
        id
      }
      asToken1: pairs(
        first: 15
        orderBy: trackedReserveETH
        orderDirection: desc
        where: { totalTransactions_gt: 1, token1: $address, token0_not_in: $blacklist }
      ) {
        id
      }
    }
  `
}

export interface PoolsForTokenResponse {
  asToken0: {
    id: string
  }[]
  asToken1: {
    id: string
  }[]
}

const fetchPoolsForToken = async (address: string) => {
  try {
    const data = await request<PoolsForTokenResponse>(subgraphUrls.v2Exchange, POOLS_FOR_TOKEN(), {
      address,
      blacklist: TOKEN_BLACKLIST.map((r) => r.toLocaleUpperCase()),
    })

    return {
      error: false,
      addresses: data.asToken0
        .concat(data.asToken1)
        .map((p) => p.id)
        .map((d) => d.toLowerCase()),
    }
  } catch (error) {
    console.error(`Failed to fetch pools for token ${address}`, error)
    return {
      error: true,
    }
  }
}

export default fetchPoolsForToken
