import { gql, request } from 'graphql-request'
import { BATCH_SIZE, subgraphUrls, tokensToBeOverridden } from 'lib/graph-queries/const'
import { PoolV3AccData, PoolV3Raw } from 'lib/graph-queries/types'

const FLOAT64_Q96 = 2 ** 96

export const getV3Pools = async <AccOnly extends boolean = false>({
  blockNumber,
  accOnly,
  skip = 0,
}: {
  blockNumber?: number // Optional block number for fetching historical data.
  accOnly?: AccOnly // Optional flag to fetch simplified data.
  skip?: number // Default `skip` value is `0`, allowing pagination.
} = {}): Promise<(AccOnly extends true ? PoolV3AccData : PoolV3Raw)[]> => {
  const document = gql`
      query ($first: Int, $skip: Int, ${blockNumber !== undefined ? '$blockNumber: Int' : ''}) {
        pools(
          first: $first,
          skip: $skip,
          ${blockNumber !== undefined ? 'block: { number: $blockNumber }' : ''}
        ) {
          id
          totalValueLockedUSD
          volumeUSD
          feesUSD
          protocolFeesUSD
          txCount
          liquidityProviderCount
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
            sqrtPrice
            feeTier
            feeProtocol
            liquidity
            totalValueLockedToken0
            totalValueLockedToken1
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

  const { pools } = await request(subgraphUrls.v3Exchange, document, variables)

  // Recursively fetch more pools if the API returned exactly `BATCH_SIZE` items.
  if (pools.length === BATCH_SIZE) {
    const nextPools = await getV3Pools({ blockNumber, accOnly, skip: skip + BATCH_SIZE })
    return [...pools, ...nextPools] // Merge current batch with next batch.
  }

  return accOnly
    ? pools.map(
        (pool) =>
          ({
            id: pool.id,
            tvlUSD: +pool.totalValueLockedUSD,
            volumeUSD: +pool.volumeUSD,
            feeUSD: +pool.feesUSD,
            protocolFeeUSD: +pool.protocolFeesUSD,
            txCount: +pool.txCount,
            liquidityProviderCount: +pool.liquidityProviderCount,
          } as PoolV3AccData),
      )
    : pools.map(
        (pool) =>
          ({
            id: pool.id,
            token0: tokensToBeOverridden[pool.token0.id] ?? pool.token0,
            token1: tokensToBeOverridden[pool.token1.id] ?? pool.token1,
            feeTier: pool.feeTier,
            feeProtocol: pool.feeProtocol,
            reserve0: +pool.totalValueLockedToken0,
            reserve1: +pool.totalValueLockedToken1,
            price: (+pool.sqrtPrice / FLOAT64_Q96) ** 2 * (10 ** +pool.token0.decimals / 10 ** +pool.token1.decimals),
            tvlUSD: +pool.totalValueLockedUSD,
            volumeUSD: +pool.volumeUSD,
            feeUSD: +pool.feesUSD,
            protocolFeeUSD: +pool.protocolFeesUSD,
            txCount: +pool.txCount,
            liquidityProviderCount: +pool.liquidityProviderCount,
          } as PoolV3Raw),
      )
}
