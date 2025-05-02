import { getBlockNumbers, getCachedBlockNumbers } from 'lib/get-cached-block-numbers'
import { getV2Pools } from 'lib/graph-queries/get-v2-pools'
import { getV3Pools } from 'lib/graph-queries/get-v3-pools'
import { PoolV2AccData, PoolV2Base, PoolV3AccData, PoolV3Base, PoolV3Raw } from 'lib/graph-queries/types'
import { PoolV2AccDataCache, PoolV3AccDataCache, v2PoolsAccDataCache, v3PoolsAccDataCache } from 'lru-caches'
import { v2PoolsAccDataMongoCache, v3PoolsAccDataMongoCache } from 'mongo-caches'
import { localCachedProactive } from 'utils/localCachedProactive'
import { localCachedV2 } from 'utils/localCachedV2'
import { requestWithRetry } from 'utils/requestWithRetry'

const USE_MONGO_CACHE = process.env.USE_MONGO_CACHE === 'true'

const MINUTE = 60_000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

// FIXME: do we need threshold?
const POOL_LIQUIDITY_USD_THRESHOLD = 10

enum PoolV2AccDataCacheIndex {
  tvlUSD = 0,
  volumeUSD = 1,
  txCount = 2,
}

const compressV2PoolAccData = (pools: PoolV2AccData[]): PoolV2AccDataCache => {
  return Object.fromEntries(pools.map(({ id, tvlUSD, volumeUSD, txCount }) => [id, [tvlUSD, volumeUSD, txCount]]))
}

const getV2PoolsAccData = async (blockNumber: number) => {
  if (USE_MONGO_CACHE) {
    const pools = await v2PoolsAccDataMongoCache.get(blockNumber)
    if (pools) {
      return pools
    }
    // check lru cache
  } else if (v2PoolsAccDataCache.get(blockNumber.toString())) {
    return v2PoolsAccDataCache.get(blockNumber.toString())!
  }

  // fetch data
  const poolsPromise = getV2Pools({ blockNumber, accOnly: true })
  const pools = await requestWithRetry(poolsPromise, {
    logPrefix: `getV2PoolsAccData(${blockNumber})`,
  })

  // cache data
  const poolsMap = compressV2PoolAccData(pools)

  if (USE_MONGO_CACHE) {
    await v2PoolsAccDataMongoCache.put(blockNumber, poolsMap)
  } else {
    v2PoolsAccDataCache.put(blockNumber.toString(), poolsMap)
  }

  return poolsMap
}

enum PoolV3AccDataCacheIndex {
  tvlUSD = 0,
  volumeUSD = 1,
  txCount = 2,
  feeUSD = 3,
  protocolFeeUSD = 4,
  liquidityProviderCount = 5,
}

const compressV3PoolAccData = (pools: PoolV3AccData[]): PoolV3AccDataCache => {
  return Object.fromEntries(
    pools.map(({ id, tvlUSD, volumeUSD, txCount, feeUSD, protocolFeeUSD, liquidityProviderCount }) => [
      id,
      [tvlUSD, volumeUSD, txCount, feeUSD, protocolFeeUSD, liquidityProviderCount],
    ]),
  )
}

const getV3PoolsAccData = async (blockNumber: number) => {
  if (USE_MONGO_CACHE) {
    const pools = await v3PoolsAccDataMongoCache.get(blockNumber)
    if (pools) {
      return pools
    }
    // check lru cache
  } else if (v3PoolsAccDataCache.get(blockNumber.toString())) {
    return v3PoolsAccDataCache.get(blockNumber.toString())!
  }

  // fetch data
  const poolsPromise = getV3Pools({ blockNumber, accOnly: true })
  const pools = await requestWithRetry(poolsPromise, {
    logPrefix: `getV3PoolsAccData(${blockNumber})`,
  })

  // cache data
  const poolsMap = compressV3PoolAccData(pools)

  if (USE_MONGO_CACHE) {
    await v3PoolsAccDataMongoCache.put(blockNumber, poolsMap)
  } else {
    v3PoolsAccDataCache.put(blockNumber.toString(), poolsMap)
  }

  return poolsMap
}

export type PoolV2Detailed = PoolV2Base & {
  tvlUSD: {
    current: number
    '7D': number | null
    '24H': number | null
  }
  volumeUSD: {
    total: number
    '7D': number | null
    '24H': number | null
  }
  txCount: {
    total: number
    '7D': number | null
    '24H': number | null
  }
}

const getProactivelyCachedV2Pools = localCachedProactive(
  async () => {
    const [blockNumber] = await getCachedBlockNumbers([Date.now()])
    const pools = await requestWithRetry(getV2Pools({ blockNumber }), {
      logPrefix: `getV2PoolsDetailedData`,
    })

    // cache data
    const compressedV2Pools = compressV2PoolAccData(pools)

    if (USE_MONGO_CACHE) {
      await v2PoolsAccDataMongoCache.put(blockNumber, compressedV2Pools)
    } else {
      v2PoolsAccDataCache.put(blockNumber.toString(), compressedV2Pools)
    }

    return pools
  },
  { interval: USE_MONGO_CACHE ? 3 * MINUTE : 5 * MINUTE },
)

const getV2PoolsDetailedData = async ({
  blockNumber7D,
  blockNumber24H,
}: {
  blockNumber7D: number
  blockNumber24H: number
}) => {
  // fetch data
  const [_pools7D, _pools24H, _pools] = await Promise.allSettled([
    getV2PoolsAccData(blockNumber7D),
    getV2PoolsAccData(blockNumber24H),
    getProactivelyCachedV2Pools(),
  ])

  const pools7D = _pools7D.status === 'fulfilled' ? _pools7D.value : {}
  const pools24H = _pools24H.status === 'fulfilled' ? _pools24H.value : {}
  const pools = _pools.status === 'fulfilled' ? _pools.value : []

  const poolsDetails = pools
    .filter(({ tvlUSD }) => tvlUSD > POOL_LIQUIDITY_USD_THRESHOLD)
    .map(
      ({ tvlUSD, volumeUSD, txCount, ...pool }) =>
        ({
          ...pool,
          tvlUSD: {
            current: tvlUSD,
            '7D': !pools7D[pool.id]?.[PoolV2AccDataCacheIndex.tvlUSD]
              ? null
              : tvlUSD - pools7D[pool.id][PoolV2AccDataCacheIndex.tvlUSD],
            '24H': !pools24H[pool.id]?.[PoolV2AccDataCacheIndex.tvlUSD]
              ? null
              : tvlUSD - pools24H[pool.id][PoolV2AccDataCacheIndex.tvlUSD],
          },
          volumeUSD: {
            total: volumeUSD,
            '7D': !pools7D[pool.id]?.[PoolV2AccDataCacheIndex.volumeUSD]
              ? null
              : volumeUSD - pools7D[pool.id][PoolV2AccDataCacheIndex.volumeUSD],
            '24H': !pools24H[pool.id]?.[PoolV2AccDataCacheIndex.volumeUSD]
              ? null
              : volumeUSD - pools24H[pool.id][PoolV2AccDataCacheIndex.volumeUSD],
          },
          txCount: {
            total: txCount,
            '7D': !pools7D[pool.id]?.[PoolV2AccDataCacheIndex.txCount]
              ? null
              : txCount - pools7D[pool.id][PoolV2AccDataCacheIndex.txCount],
            '24H': !pools24H[pool.id]?.[PoolV2AccDataCacheIndex.txCount]
              ? null
              : txCount - pools24H[pool.id][PoolV2AccDataCacheIndex.txCount],
          },
        } as PoolV2Detailed),
    )
    .sort((a, b) => (b.volumeUSD['24H'] ?? 0) - (a.volumeUSD['24H'] ?? 0))

  return poolsDetails
}

export type PoolV3Detailed = PoolV3Base & {
  tvlUSD: {
    current: number
    '7D': number | null
    '24H': number | null
  }
  volumeUSD: {
    total: number
    '7D': number | null
    '24H': number | null
  }
  feeUSD: {
    total: number
    '7D': number | null
    '24H': number | null
  }
  protocolFeeUSD: {
    total: number
    '7D': number | null
    '24H': number | null
  }
  txCount: {
    total: number
    '7D': number | null
    '24H': number | null
  }
  liquidityProviderCount: {
    current: number
    '7D': number | null
    '24H': number | null
  }
}

const getProactivelyCachedV3Pools = localCachedProactive(
  async () => {
    const [blockNumber] = await getCachedBlockNumbers([Date.now()])
    const pools = await requestWithRetry(getV3Pools({ blockNumber }), {
      logPrefix: `getV3PoolsDetailedData`,
    })

    // cache data
    const compressedV3Pools = compressV3PoolAccData(pools)

    if (USE_MONGO_CACHE) {
      await v3PoolsAccDataMongoCache.put(blockNumber, compressedV3Pools)
    } else {
      v3PoolsAccDataCache.put(blockNumber.toString(), compressedV3Pools)
    }

    return pools
  },
  { interval: USE_MONGO_CACHE ? 3 * MINUTE : 5 * MINUTE },
)

const getV3PoolsDetailedData = async ({
  blockNumber7D,
  blockNumber24H,
}: {
  blockNumber7D: number
  blockNumber24H: number
}) => {
  // fetch data
  const [_pools7D, _pools24H, _pools] = await Promise.allSettled([
    getV3PoolsAccData(blockNumber7D),
    getV3PoolsAccData(blockNumber24H),
    getProactivelyCachedV3Pools(),
  ])

  const pools7D = _pools7D.status === 'fulfilled' ? _pools7D.value : ({} as PoolV3AccDataCache)
  const pools24H = _pools24H.status === 'fulfilled' ? _pools24H.value : ({} as PoolV3AccDataCache)
  const pools = _pools.status === 'fulfilled' ? _pools.value : ([] as PoolV3Raw[])

  const poolsDetails = pools
    .filter(({ tvlUSD }) => tvlUSD > POOL_LIQUIDITY_USD_THRESHOLD)
    .map(
      ({ tvlUSD, volumeUSD, feeUSD, protocolFeeUSD, txCount, liquidityProviderCount, ...pool }) =>
        ({
          ...pool,
          tvlUSD: {
            current: tvlUSD,
            '7D': !pools7D[pool.id]?.[PoolV3AccDataCacheIndex.tvlUSD]
              ? null
              : tvlUSD - pools7D[pool.id][PoolV3AccDataCacheIndex.tvlUSD],
            '24H': !pools24H[pool.id]?.[PoolV3AccDataCacheIndex.tvlUSD]
              ? null
              : tvlUSD - pools24H[pool.id][PoolV3AccDataCacheIndex.tvlUSD],
          },
          volumeUSD: {
            total: volumeUSD,
            '7D': !pools7D[pool.id]?.[PoolV3AccDataCacheIndex.volumeUSD]
              ? null
              : volumeUSD - pools7D[pool.id][PoolV3AccDataCacheIndex.volumeUSD],
            '24H': !pools24H[pool.id]?.[PoolV3AccDataCacheIndex.volumeUSD]
              ? null
              : volumeUSD - pools24H[pool.id][PoolV3AccDataCacheIndex.volumeUSD],
          },
          feeUSD: {
            total: feeUSD,
            '7D': !pools7D[pool.id]?.[PoolV3AccDataCacheIndex.feeUSD]
              ? null
              : feeUSD - pools7D[pool.id][PoolV3AccDataCacheIndex.feeUSD],
            '24H': !pools24H[pool.id]?.[PoolV3AccDataCacheIndex.feeUSD]
              ? null
              : feeUSD - pools24H[pool.id][PoolV3AccDataCacheIndex.feeUSD],
          },
          protocolFeeUSD: {
            total: protocolFeeUSD,
            '7D': !pools7D[pool.id]?.[PoolV3AccDataCacheIndex.protocolFeeUSD]
              ? null
              : protocolFeeUSD - pools7D[pool.id][PoolV3AccDataCacheIndex.protocolFeeUSD],
            '24H': !pools24H[pool.id]?.[PoolV3AccDataCacheIndex.protocolFeeUSD]
              ? null
              : protocolFeeUSD - pools24H[pool.id][PoolV3AccDataCacheIndex.protocolFeeUSD],
          },
          txCount: {
            total: txCount,
            '7D': !pools7D[pool.id]?.[PoolV3AccDataCacheIndex.txCount]
              ? null
              : txCount - pools7D[pool.id][PoolV3AccDataCacheIndex.txCount],
            '24H': !pools24H[pool.id]?.[PoolV3AccDataCacheIndex.txCount]
              ? null
              : txCount - pools24H[pool.id][PoolV3AccDataCacheIndex.txCount],
          },
          liquidityProviderCount: {
            current: liquidityProviderCount,
            '7D': !pools7D[pool.id]?.[PoolV3AccDataCacheIndex.liquidityProviderCount]
              ? null
              : liquidityProviderCount - pools7D[pool.id][PoolV3AccDataCacheIndex.liquidityProviderCount],
            '24H': !pools24H[pool.id]?.[PoolV3AccDataCacheIndex.liquidityProviderCount]
              ? null
              : liquidityProviderCount - pools24H[pool.id][PoolV3AccDataCacheIndex.liquidityProviderCount],
          },
        } as PoolV3Detailed),
    )
    .sort((a, b) => (b.volumeUSD['24H'] ?? 0) - (a.volumeUSD['24H'] ?? 0))

  return poolsDetails
}

export const getCachedPoolsData = localCachedV2(
  async () => {
    const now = Date.now()
    const timestamps = [now - 7 * DAY, now - DAY]
    const blockNumbers = await getCachedBlockNumbers(timestamps)

    const blocks = {
      blockNumber7D: blockNumbers[0],
      blockNumber24H: blockNumbers[1],
    }

    const [v2Pools, v3Pools] = await Promise.all([getV2PoolsDetailedData(blocks), getV3PoolsDetailedData(blocks)])

    return { v2Pools, v3Pools }
  },
  {
    staleWhileRevalidate: true,
    ttl: 5 * MINUTE,
    ttlOnCatch: 5_000,
  },
).cachedFetcher

const getV2PoolsAccDataByIds = async ({ poolIds, blockNumber }: { poolIds: string[]; blockNumber: number }) => {
  if (poolIds.length === 0) {
    return {}
  }

  // fetch data
  const poolsPromise = getV2Pools({ blockNumber, poolIds, accOnly: true })
  const pools = await requestWithRetry(poolsPromise, {
    logPrefix: `getV2PoolsAccDataByIds(${blockNumber})`,
  })

  const poolsMap = Object.fromEntries(pools.map(({ id, ...pool }) => [id, pool]))

  return poolsMap
}

const getV3PoolsAccDataByIds = async ({ poolIds, blockNumber }: { poolIds: string[]; blockNumber: number }) => {
  if (poolIds.length === 0) {
    return {}
  }

  // fetch data
  const poolsPromise = getV3Pools({ blockNumber, poolIds, accOnly: true })
  const pools = await requestWithRetry(poolsPromise, {
    logPrefix: `getV3PoolsAccDataByIds(${blockNumber})`,
  })

  const poolsMap = Object.fromEntries(pools.map(({ id, ...pool }) => [id, pool]))

  return poolsMap
}

const getV2PoolsDetailedDataByIds = async ({
  poolIds,
  blockNumber7D,
  blockNumber24H,
  blockNumberNow,
}: {
  poolIds: string[]
  blockNumber7D: number
  blockNumber24H: number
  blockNumberNow: number
}) => {
  if (poolIds.length === 0) {
    return []
  }

  // fetch data
  const poolsPromise = getV2Pools({ blockNumber: blockNumberNow, poolIds })
  const [_pools7D, _pools24H, _pools] = await Promise.allSettled([
    getV2PoolsAccDataByIds({ poolIds, blockNumber: blockNumber7D }),
    getV2PoolsAccDataByIds({ poolIds, blockNumber: blockNumber24H }),
    requestWithRetry(poolsPromise, {
      logPrefix: `getV2PoolsDetailedDataByIds`,
    }),
  ])

  const pools7D = _pools7D.status === 'fulfilled' ? _pools7D.value : {}
  const pools24H = _pools24H.status === 'fulfilled' ? _pools24H.value : {}
  const pools = _pools.status === 'fulfilled' ? _pools.value : []

  const poolsDetails = pools
    .map(
      ({ tvlUSD, volumeUSD, txCount, ...pool }) =>
        ({
          ...pool,
          tvlUSD: {
            current: tvlUSD,
            '7D': !pools7D[pool.id]?.tvlUSD ? null : tvlUSD - pools7D[pool.id].tvlUSD,
            '24H': !pools24H[pool.id]?.tvlUSD ? null : tvlUSD - pools24H[pool.id].tvlUSD,
          },
          volumeUSD: {
            total: volumeUSD,
            '7D': !pools7D[pool.id]?.volumeUSD ? null : volumeUSD - pools7D[pool.id].volumeUSD,
            '24H': !pools24H[pool.id]?.volumeUSD ? null : volumeUSD - pools24H[pool.id].volumeUSD,
          },
          txCount: {
            total: txCount,
            '7D': !pools7D[pool.id]?.txCount ? null : txCount - pools7D[pool.id].txCount,
            '24H': !pools24H[pool.id]?.txCount ? null : txCount - pools24H[pool.id].txCount,
          },
        } as PoolV2Detailed),
    )
    .sort((a, b) => (b.volumeUSD['24H'] ?? 0) - (a.volumeUSD['24H'] ?? 0))

  return poolsDetails
}

const getV3PoolsDetailedDataByIds = async ({
  poolIds,
  blockNumber7D,
  blockNumber24H,
  blockNumberNow,
}: {
  poolIds: string[]
  blockNumber7D: number
  blockNumber24H: number
  blockNumberNow: number
}) => {
  if (poolIds.length === 0) {
    return []
  }

  // fetch data
  const poolsPromise = getV3Pools({ blockNumber: blockNumberNow, poolIds })
  const [_pools7D, _pools24H, _pools] = await Promise.allSettled([
    getV3PoolsAccDataByIds({ poolIds, blockNumber: blockNumber7D }),
    getV3PoolsAccDataByIds({ poolIds, blockNumber: blockNumber24H }),
    requestWithRetry(poolsPromise, {
      logPrefix: `getV3PoolsDetailedDataByIds`,
    }),
  ])

  const pools7D = _pools7D.status === 'fulfilled' ? _pools7D.value : {}
  const pools24H = _pools24H.status === 'fulfilled' ? _pools24H.value : {}
  const pools = _pools.status === 'fulfilled' ? _pools.value : ([] as PoolV3Raw[])

  const poolsDetails = pools
    .map(
      ({ tvlUSD, volumeUSD, feeUSD, protocolFeeUSD, txCount, liquidityProviderCount, ...pool }) =>
        ({
          ...pool,
          tvlUSD: {
            current: tvlUSD,
            '7D': !pools7D[pool.id]?.tvlUSD ? null : tvlUSD - pools7D[pool.id].tvlUSD,
            '24H': !pools24H[pool.id]?.tvlUSD ? null : tvlUSD - pools24H[pool.id].tvlUSD,
          },
          volumeUSD: {
            total: volumeUSD,
            '7D': !pools7D[pool.id]?.volumeUSD ? null : volumeUSD - pools7D[pool.id].volumeUSD,
            '24H': !pools24H[pool.id]?.volumeUSD ? null : volumeUSD - pools24H[pool.id].volumeUSD,
          },
          feeUSD: {
            total: feeUSD,
            '7D': !pools7D[pool.id]?.feeUSD ? null : feeUSD - pools7D[pool.id].feeUSD,
            '24H': !pools24H[pool.id]?.feeUSD ? null : feeUSD - pools24H[pool.id].feeUSD,
          },
          protocolFeeUSD: {
            total: protocolFeeUSD,
            '7D': !pools7D[pool.id]?.protocolFeeUSD ? null : protocolFeeUSD - pools7D[pool.id].protocolFeeUSD,
            '24H': !pools24H[pool.id]?.protocolFeeUSD ? null : protocolFeeUSD - pools24H[pool.id].protocolFeeUSD,
          },
          txCount: {
            total: txCount,
            '7D': !pools7D[pool.id]?.txCount ? null : txCount - pools7D[pool.id].txCount,
            '24H': !pools24H[pool.id]?.txCount ? null : txCount - pools24H[pool.id].txCount,
          },
          liquidityProviderCount: {
            current: liquidityProviderCount,
            '7D': !pools7D[pool.id]?.liquidityProviderCount
              ? null
              : liquidityProviderCount - pools7D[pool.id].liquidityProviderCount,
            '24H': !pools24H[pool.id]?.liquidityProviderCount
              ? null
              : liquidityProviderCount - pools24H[pool.id].liquidityProviderCount,
          },
        } as PoolV3Detailed),
    )
    .sort((a, b) => (b.volumeUSD['24H'] ?? 0) - (a.volumeUSD['24H'] ?? 0))

  return poolsDetails
}

export const getPoolsDataByIds = async (poolIds: string[]) => {
  const now = Date.now()
  const timestamps = [now - 7 * DAY, now - DAY, now]
  const blockNumbers = await getBlockNumbers(timestamps, { bucketSize: 10 })

  const blocks = {
    blockNumber7D: blockNumbers[0],
    blockNumber24H: blockNumbers[1],
    blockNumberNow: blockNumbers[2],
  }

  const [v2Pools, v3Pools] = await Promise.all([
    getV2PoolsDetailedDataByIds({ poolIds, ...blocks }),
    getV3PoolsDetailedDataByIds({ poolIds, ...blocks }),
  ])

  return { v2Pools, v3Pools }
}
