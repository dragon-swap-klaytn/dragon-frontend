import { gql, request } from 'graphql-request'
import { subgraphUrls } from 'lib/graph-queries/const'
import { PoolV2AccData, PoolV2Raw } from 'lib/graph-queries/types'

const BATCH_SIZE = 1_000 // Defines the number of pairs fetched per request to avoid exceeding API limits.

export const getV2Pools = async <AccOnly extends boolean = false>({
  blockNumber,
  accOnly,
  skip = 0,
}: {
  blockNumber?: number // Optional block number for fetching historical data.
  accOnly?: AccOnly // Optional flag to fetch simplified data.
  skip?: number // Default `skip` value is `0`, allowing pagination.
} = {}): Promise<(AccOnly extends true ? PoolV2AccData : PoolV2Raw)[]> => {
  const document = accOnly
    ? gql`
        query ($first: Int, $skip: Int, $blockNumber: Int) {
          pairs(
            first: $first, 
            skip: $skip, 
            ${blockNumber ? 'block: { number: $blockNumber }' : ''}
          ) {
            id
            volumeUSD
            totalTransactions
          }
        }
      `
    : gql`
        query ($first: Int, $skip: Int, $blockNumber: Int) {
          pairs(
            first: $first, 
            skip: $skip, 
            ${blockNumber ? 'block: { number: $blockNumber }' : ''}
          ) {
            id
            # name
            token0 {
              id
              # name
              # symbol
              # decimals
            }
            token1 {
              id
              # name
              # symbol
              # decimals
            }
            reserve0
            reserve1
            # totalSupply
            reserveUSD
            volumeUSD
            totalTransactions
          }
        }
      `

  // Fetch the pairs from the subgraph.
  const { pairs } = await request(subgraphUrls.v2Exchange, document, {
    first: BATCH_SIZE,
    skip,
    blockNumber,
  })

  // Recursively fetch more pairs if the API returned exactly `BATCH_SIZE` items.
  if (pairs.length === BATCH_SIZE) {
    const nextPools = await getV2Pools({ blockNumber, skip: skip + BATCH_SIZE })
    return [...pairs, ...nextPools] // Merge current batch with next batch.
  }

  if (accOnly) {
    return pairs.map(
      (pair) =>
        ({
          id: pair.id,
          volumeUSD: +pair.volumeUSD,
          txCount: +pair.totalTransactions,
        } as PoolV2AccData),
    )
  }

  return pairs.map(
    (pair) =>
      ({
        ...pair,
        token0: pair.token0.id,
        token1: pair.token1.id,
        reserve0: +pair.reserve0,
        reserve1: +pair.reserve1,
        tvlUSD: +pair.reserveUSD,
        volumeUSD: +pair.volumeUSD,
        txCount: +pair.totalTransactions,
      } as PoolV2Raw),
  )
}
