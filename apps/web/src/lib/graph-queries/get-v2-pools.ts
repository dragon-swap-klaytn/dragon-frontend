import { gql, request } from 'graphql-request'
import { BATCH_SIZE, subgraphUrls } from 'lib/graph-queries/const'
import { PoolV2AccData, PoolV2Raw } from 'lib/graph-queries/types'
import { overrideToken } from 'lib/graph-queries/utils'

export const getV2Pools = async <AccOnly extends boolean = false>({
  blockNumber,
  poolIds,
  accOnly,
  skip = 0,
}: {
  blockNumber?: number // Optional block number for fetching historical data.
  poolIds?: string[] // Optional list of pool IDs to fetch
  accOnly?: AccOnly // Optional flag to fetch simplified data.
  skip?: number // Default `skip` value is `0`, allowing pagination.
} = {}): Promise<(AccOnly extends true ? PoolV2AccData : PoolV2Raw)[]> => {
  const document = gql`
    query ($first: Int, $skip: Int, ${blockNumber !== undefined ? '$blockNumber: Int' : ''}, ${
    poolIds !== undefined ? '$poolIds: [ID!]' : ''
  }) {
      pairs(
        first: $first,
        skip: $skip,
        ${blockNumber !== undefined ? 'block: { number: $blockNumber }' : ''},
        ${poolIds !== undefined ? 'where: { id_in: $poolIds }' : ''}
      ) {
        id
        reserveUSD
        volumeUSD
        totalTransactions
        ${
          accOnly
            ? ''
            : `
          token0 {
            id
            symbol
            name
            decimals
          }
          token1 {
            id
            symbol
            name
            decimals
          }
          reserve0
          reserve1
          volumeUSD
          totalTransactions
        `
        }
      }
    }
  `

  // Define query variables safely
  const variables: Record<string, any> = poolIds?.length
    ? { first: poolIds.length, skip: 0 }
    : { first: BATCH_SIZE, skip }
  if (blockNumber !== undefined) {
    variables.blockNumber = blockNumber
  }
  if (poolIds !== undefined) {
    variables.poolIds = poolIds
  }

  // Fetch the pairs from the subgraph.
  const { pairs } = await request(subgraphUrls.v2Exchange, document, variables, {
    'DS-User-Agent': 'dgswap-frontend',
  })

  // Recursively fetch more pairs if the API returned exactly `BATCH_SIZE` items.
  if (!poolIds && pairs.length === BATCH_SIZE) {
    const nextPools = await getV2Pools({ blockNumber, accOnly, skip: skip + BATCH_SIZE })
    return [...pairs, ...nextPools] // Merge current batch with next batch.
  }

  return accOnly
    ? pairs.map(
        (pair) =>
          ({
            id: pair.id,
            tvlUSD: +pair.reserveUSD,
            volumeUSD: +pair.volumeUSD,
            txCount: +pair.totalTransactions,
          } as PoolV2AccData),
      )
    : pairs.map(
        (pair) =>
          ({
            id: pair.id,
            token0: overrideToken(pair.token0),
            token1: overrideToken(pair.token1),
            reserve0: +pair.reserve0,
            reserve1: +pair.reserve1,
            price: +pair.reserve1 / +pair.reserve0,
            tvlUSD: +pair.reserveUSD,
            volumeUSD: +pair.volumeUSD,
            txCount: +pair.totalTransactions,
          } as PoolV2Raw),
      )
}
