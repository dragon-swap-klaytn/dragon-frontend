import { getCachedBlockNumbers } from 'lib/get-cached-block-numbers'
import { getV2Pools } from 'lib/graph-queries/get-v2-pools'
import { getV3Pools } from 'lib/graph-queries/get-v3-pools'
import { PoolV2Base, PoolV3Base } from 'lib/graph-queries/types'
import { v2PoolsAccDataCache, v3PoolsAccDataCache } from 'lru-caches'
import { localCachedV2 } from 'utils/localCachedV2'
import { requestWithRetry } from 'utils/requestWithRetry'

const MINUTE = 60_000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

// FIXME: do we need threshold?
const POOL_LIQUIDITY_USD_THRESHOLD = 10

const getV2PoolsAccData = async (blockNumber: number) => {
  // check lru cache
  if (v2PoolsAccDataCache.get(blockNumber.toString())) {
    return v2PoolsAccDataCache.get(blockNumber.toString())!
  }

  // fetch data
  const poolsPromise = getV2Pools({ blockNumber, accOnly: true })
  const pools = await requestWithRetry(poolsPromise, {
    logPrefix: `getV2PoolsAccData(${blockNumber})`,
  })

  // cache data
  const poolsMap = Object.fromEntries(pools.map(({ id, ...pool }) => [id, pool]))

  v2PoolsAccDataCache.put(blockNumber.toString(), poolsMap)

  return poolsMap
}

const getV3PoolsAccData = async (blockNumber: number) => {
  // check lru cache
  if (v3PoolsAccDataCache.get(blockNumber.toString())) {
    return v3PoolsAccDataCache.get(blockNumber.toString())!
  }

  // fetch data
  const poolsPromise = getV3Pools({ blockNumber, accOnly: true })
  const pools = await requestWithRetry(poolsPromise, {
    logPrefix: `getV3PoolsAccData(${blockNumber})`,
  })

  // cache data
  const poolsMap = Object.fromEntries(pools.map(({ id, ...pool }) => [id, pool]))

  v3PoolsAccDataCache.put(blockNumber.toString(), poolsMap)

  return poolsMap
}

export type PoolV2Detailed = PoolV2Base & {
  volumeUSD: {
    total: number
    '7D': number
    '24H': number
  }
  txCount: {
    total: number
    '7D': number
    '24H': number
  }
}

const getV2PoolsDetailedData = async ({
  blockNumber7D,
  blockNumber24H,
  blockNumberNow,
}: {
  blockNumber7D: number
  blockNumber24H: number
  blockNumberNow: number
}) => {
  // fetch data
  const poolsPromise = getV2Pools({ blockNumber: blockNumberNow })
  const [pools7D, pools24H, pools] = await Promise.all([
    getV2PoolsAccData(blockNumber7D),
    getV2PoolsAccData(blockNumber24H),
    requestWithRetry(poolsPromise, {
      logPrefix: `getV2PoolsDetailedData`,
    }),
  ])

  const poolsDetails = pools
    .filter(({ tvlUSD }) => tvlUSD > POOL_LIQUIDITY_USD_THRESHOLD)
    .map(
      ({ volumeUSD, txCount, ...pool }) =>
        ({
          ...pool,
          volumeUSD: {
            total: volumeUSD,
            '7D': volumeUSD - (pools7D[pool.id]?.volumeUSD ?? 0),
            '24H': volumeUSD - (pools24H[pool.id]?.volumeUSD ?? 0),
          },
          txCount: {
            total: txCount,
            '7D': txCount - (pools7D[pool.id]?.txCount ?? 0),
            '24H': txCount - (pools24H[pool.id]?.txCount ?? 0),
          },
        } as PoolV2Detailed),
    )
    .sort((a, b) => b.volumeUSD['24H'] - a.volumeUSD['24H'])

  return poolsDetails
}

export type PoolV3Detailed = PoolV3Base & {
  volumeUSD: {
    total: number
    '7D': number
    '24H': number
  }
  feeUSD: {
    total: number
    '7D': number
    '24H': number
  }
  protocolFeeUSD: {
    total: number
    '7D': number
    '24H': number
  }
  txCount: {
    total: number
    '7D': number
    '24H': number
  }
  liquidityProviderCount: {
    now: number
    '7D': number
    '24H': number
  }
}

const getV3PoolsDetailedData = async ({
  blockNumber7D,
  blockNumber24H,
  blockNumberNow,
}: {
  blockNumber7D: number
  blockNumber24H: number
  blockNumberNow: number
}) => {
  // fetch data
  const poolsPromise = getV3Pools({ blockNumber: blockNumberNow })
  const [pools7D, pools24H, pools] = await Promise.all([
    getV3PoolsAccData(blockNumber7D),
    getV3PoolsAccData(blockNumber24H),
    requestWithRetry(poolsPromise, {
      // logPrefix: `getV3PoolsDetailedData(${blockNumberNow})`,
      logPrefix: `getV3PoolsDetailedData`,
    }),
  ])

  const poolsDetails = pools
    .filter(({ tvlUSD }) => tvlUSD > POOL_LIQUIDITY_USD_THRESHOLD)
    .map(
      ({ volumeUSD, feeUSD, protocolFeeUSD, txCount, liquidityProviderCount, ...pool }) =>
        ({
          ...pool,
          volumeUSD: {
            total: volumeUSD,
            '7D': volumeUSD - (pools7D[pool.id]?.volumeUSD ?? 0),
            '24H': volumeUSD - (pools24H[pool.id]?.volumeUSD ?? 0),
          },
          feeUSD: {
            total: feeUSD,
            '7D': feeUSD - (pools7D[pool.id]?.feeUSD ?? 0),
            '24H': feeUSD - (pools24H[pool.id]?.feeUSD ?? 0),
          },
          protocolFeeUSD: {
            total: protocolFeeUSD,
            '7D': protocolFeeUSD - (pools7D[pool.id]?.protocolFeeUSD ?? 0),
            '24H': protocolFeeUSD - (pools24H[pool.id]?.protocolFeeUSD ?? 0),
          },
          txCount: {
            total: txCount,
            '7D': txCount - (pools7D[pool.id]?.txCount ?? 0),
            '24H': txCount - (pools24H[pool.id]?.txCount ?? 0),
          },
          liquidityProviderCount: {
            now: liquidityProviderCount,
            '7D': liquidityProviderCount - (pools7D[pool.id]?.liquidityProviderCount ?? 0),
            '24H': liquidityProviderCount - (pools24H[pool.id]?.liquidityProviderCount ?? 0),
          },
        } as PoolV3Detailed),
    )
    .sort((a, b) => b.volumeUSD['24H'] - a.volumeUSD['24H'])

  return poolsDetails
}

export const getCachedPoolsData = localCachedV2(
  async () => {
    const now = Date.now()
    const timestamps = [now - 7 * DAY, now - DAY, now]
    const blockNumbers = await getCachedBlockNumbers(timestamps)

    const blocks = {
      blockNumber7D: blockNumbers[0],
      blockNumber24H: blockNumbers[1],
      blockNumberNow: blockNumbers[2],
    }

    const [v2Pools, v3Pools] = await Promise.all([getV2PoolsDetailedData(blocks), getV3PoolsDetailedData(blocks)])

    return { v2Pools, v3Pools }
  },
  {
    staleWhileRevalidate: true,
    ttl: 10 * MINUTE,
    ttlOnCatch: 5_000,
  },
).cachedFetcher
