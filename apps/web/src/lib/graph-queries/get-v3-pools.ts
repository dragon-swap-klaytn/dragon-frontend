import { gql, request } from 'graphql-request'
import { subgraphUrls } from 'lib/graph-queries/const'
import { PoolV3AccData, PoolV3Raw } from 'lib/graph-queries/types'

const BATCH_SIZE = 1_000 // Defines the number of pools fetched per request to avoid exceeding API limits.

export const getV3Pools = async <AccOnly extends boolean = false>({
  blockNumber,
  accOnly,
  skip = 0,
}: {
  blockNumber?: number // Optional block number for fetching historical data.
  accOnly?: AccOnly // Optional flag to fetch simplified data.
  skip?: number // Default `skip` value is `0`, allowing pagination.
} = {}): Promise<(AccOnly extends true ? PoolV3AccData : PoolV3Raw)[]> => {
  const document = accOnly
    ? gql`
        query ($first: Int, $skip: Int, $blockNumber: Int) {
          pools(
            first: $first, 
            skip: $skip, 
            ${blockNumber ? 'block: { number: $blockNumber }' : ''}
          ) {
            id
            volumeUSD
            feesUSD
            protocolFeesUSD
            txCount
            liquidityProviderCount
          }
        }
      `
    : gql`
        query ($first: Int, $skip: Int, $blockNumber: Int) {
          pools(
            first: $first, 
            skip: $skip, 
            ${blockNumber ? 'block: { number: $blockNumber }' : ''}
          ) {
            id
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
            feeTier
            feeProtocol
            liquidity
            totalValueLockedToken0
            totalValueLockedToken1
            totalValueLockedUSD
            volumeUSD
            feesUSD
            protocolFeesUSD
            txCount
            liquidityProviderCount
          }
        }
      `

  const { pools } = await request(subgraphUrls.v3Exchange, document, {
    first: BATCH_SIZE,
    skip,
    blockNumber,
  })

  // Recursively fetch more pools if the API returned exactly `BATCH_SIZE` items.
  if (pools.length === BATCH_SIZE) {
    const nextPools = await getV3Pools({
      blockNumber,
      skip: skip + BATCH_SIZE,
    })
    return [...pools, ...nextPools] // Merge current batch with next batch.
  }

  if (accOnly) {
    return pools.map(
      (pool) =>
        ({
          id: pool.id,
          volumeUSD: +pool.volumeUSD,
          feeUSD: +pool.feesUSD,
          protocolFeeUSD: +pool.protocolFeesUSD,
          txCount: +pool.txCount,
          liquidityProviderCount: +pool.liquidityProviderCount,
        } as PoolV3AccData),
    ) // Return simplified data.
  }

  return pools.map(
    (pool) =>
      ({
        id: pool.id,
        token0: pool.token0.id,
        token1: pool.token1.id,
        feeTier: pool.feeTier,
        feeProtocol: pool.feeProtocol,
        reserve0: +pool.totalValueLockedToken0,
        reserve1: +pool.totalValueLockedToken1,
        tvlUSD: +pool.totalValueLockedUSD,
        volumeUSD: +pool.volumeUSD,
        feeUSD: +pool.feesUSD,
        protocolFeeUSD: +pool.protocolFeesUSD,
        txCount: +pool.txCount,
        liquidityProviderCount: +pool.liquidityProviderCount,
      } as PoolV3Raw),
  ) // Return final accumulated result.
}
