import { gql, request } from 'graphql-request'
import { BATCH_SIZE, subgraphUrls, tokensToBeOverridden } from 'lib/graph-queries/const'
import { PoolV2AccData, PoolV2Raw } from 'lib/graph-queries/types'

export const getV2Pools = async <AccOnly extends boolean = false>({
  blockNumber,
  accOnly,
  skip = 0,
}: {
  blockNumber?: number // Optional block number for fetching historical data.
  accOnly?: AccOnly // Optional flag to fetch simplified data.
  skip?: number // Default `skip` value is `0`, allowing pagination.
} = {}): Promise<(AccOnly extends true ? PoolV2AccData : PoolV2Raw)[]> => {
  const document = gql`
    query ($first: Int, $skip: Int, ${blockNumber !== undefined ? '$blockNumber: Int' : ''}) {
      pairs(
        first: $first,
        skip: $skip,
        ${blockNumber !== undefined ? 'block: { number: $blockNumber }' : ''}
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
  const variables: Record<string, number> = { first: BATCH_SIZE, skip }
  if (blockNumber !== undefined) {
    variables.blockNumber = blockNumber
  }

  // Fetch the pairs from the subgraph.
  const { pairs } = await request(subgraphUrls.v2Exchange, document, variables)

  // Recursively fetch more pairs if the API returned exactly `BATCH_SIZE` items.
  if (pairs.length === BATCH_SIZE) {
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
            token0: tokensToBeOverridden[pair.token0.id] ?? pair.token0,
            token1: tokensToBeOverridden[pair.token1.id] ?? pair.token1,
            reserve0: +pair.reserve0,
            reserve1: +pair.reserve1,
            price: +pair.reserve1 / +pair.reserve0,
            tvlUSD: +pair.reserveUSD,
            volumeUSD: +pair.volumeUSD,
            txCount: +pair.totalTransactions,
          } as PoolV2Raw),
      )
}
