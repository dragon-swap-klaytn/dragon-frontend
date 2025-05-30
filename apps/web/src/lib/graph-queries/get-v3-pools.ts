import { gql, request } from 'graphql-request'
import { BATCH_SIZE, FORCE_WHITELISTED_V3_POOLS, subgraphUrls } from 'lib/graph-queries/const'
import { PoolV3AccData, PoolV3Raw } from 'lib/graph-queries/types'
import { overrideToken } from 'lib/graph-queries/utils'

const FLOAT64_Q96 = 2 ** 96

const parseVolumeUSD = (pool: any): number => {
  if (FORCE_WHITELISTED_V3_POOLS.includes(pool.id)) {
    const { volumeUSD, untrackedVolumeUSD } = pool
    return +volumeUSD || +untrackedVolumeUSD || 0
  }

  return +pool.volumeUSD || 0
}

const parseTvlUSD = (pool: any): number => {
  if (FORCE_WHITELISTED_V3_POOLS.includes(pool.id)) {
    const { totalValueLockedUSD, totalValueLockedUSDUntracked } = pool
    return +totalValueLockedUSD || +totalValueLockedUSDUntracked || 0
  }

  return +pool.totalValueLockedUSD || 0
}

export const getV3Pools = async <AccOnly extends boolean = false>({
  blockNumber,
  poolIds,
  accOnly,
  skip = 0,
}: {
  blockNumber?: number // Optional block number for fetching historical data.
  poolIds?: string[] // Optional list of pool IDs to fetch
  accOnly?: AccOnly // Optional flag to fetch simplified data.
  skip?: number // Default `skip` value is `0`, allowing pagination.
} = {}): Promise<(AccOnly extends true ? PoolV3AccData : PoolV3Raw)[]> => {
  const document = gql`
      query ($first: Int, $skip: Int, ${blockNumber !== undefined ? '$blockNumber: Int' : ''}, ${
    poolIds ? '$poolIds: [ID!]!' : ''
  }) {
        pools(
          first: $first,
          skip: $skip,
          ${blockNumber !== undefined ? 'block: { number: $blockNumber }' : ''},
          ${poolIds ? 'where: { id_in: $poolIds }' : ''}
        ) {
          id
          totalValueLockedUSD
          totalValueLockedUSDUntracked
          volumeUSD
          untrackedVolumeUSD
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
            liquidity
            tick
            sqrtPrice
            feeTier
            feeProtocol
            totalValueLockedToken0
            totalValueLockedToken1
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
  if (poolIds) {
    variables.poolIds = poolIds
  }

  const { pools } = await request(subgraphUrls.v3Exchange, document, variables, {
    'X-DS-User-Agent': 'dgswap-frontend',
  })

  // Recursively fetch more pools if the API returned exactly `BATCH_SIZE` items.
  if (!poolIds && pools.length === BATCH_SIZE) {
    const nextPools = await getV3Pools({ blockNumber, accOnly, skip: skip + BATCH_SIZE })
    return [...pools, ...nextPools] // Merge current batch with next batch.
  }

  return accOnly
    ? pools.map(
        (pool) =>
          ({
            id: pool.id,
            tvlUSD: parseTvlUSD(pool),
            volumeUSD: parseVolumeUSD(pool),
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
            token0: overrideToken(pool.token0),
            token1: overrideToken(pool.token1),
            feeTier: pool.feeTier,
            feeProtocol: pool.feeProtocol,
            tick: pool.tick,
            liquidity: pool.liquidity,
            sqrtPriceX96: pool.sqrtPrice,
            reserve0: +pool.totalValueLockedToken0,
            reserve1: +pool.totalValueLockedToken1,
            price: (+pool.sqrtPrice / FLOAT64_Q96) ** 2 * (10 ** +pool.token0.decimals / 10 ** +pool.token1.decimals),
            tvlUSD: parseTvlUSD(pool),
            volumeUSD: parseVolumeUSD(pool),
            feeUSD: +pool.feesUSD,
            protocolFeeUSD: +pool.protocolFeesUSD,
            txCount: +pool.txCount,
            liquidityProviderCount: +pool.liquidityProviderCount,
          } as PoolV3Raw),
      )
}
