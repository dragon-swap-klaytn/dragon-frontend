import { getBlockNumbers, getCachedBlockNumbers } from 'lib/get-cached-block-numbers'
import { getV2Pools } from 'lib/graph-queries/get-v2-pools'
import { getV3Pools } from 'lib/graph-queries/get-v3-pools'
import { PoolV2AccData, PoolV2Base, PoolV3AccData, PoolV3Base } from 'lib/graph-queries/types'
import { PoolV2AccDataCache, PoolV3AccDataCache, v2PoolsAccDataCache, v3PoolsAccDataCache } from 'lru-caches'
import { localCachedV2 } from 'utils/localCachedV2'
import { requestWithRetry } from 'utils/requestWithRetry'

const MINUTE = 60_000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

// FIXME: do we need threshold?
const POOL_LIQUIDITY_USD_THRESHOLD = 10

enum PoolV2AccDataCacheIndex {
  TVLUSD = 0,
  VOLUMEUSD = 1,
  TXCOUNT = 2,
}

const compressV2PoolAccData = (pools: PoolV2AccData[]): PoolV2AccDataCache => {
  return Object.fromEntries(pools.map(({ id, tvlUSD, volumeUSD, txCount }) => [id, [tvlUSD, volumeUSD, txCount]]))
}

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
  const poolsMap = compressV2PoolAccData(pools)
  v2PoolsAccDataCache.put(blockNumber.toString(), poolsMap)

  return poolsMap
}

enum PoolV3AccDataCacheIndex {
  TVLUSD = 0,
  VOLUMEUSD = 1,
  TXCOUNT = 2,
  FEEUSD = 3,
  PROTOCOLFEEUSD = 4,
  LIQUIDITYPROVIDERCOUNT = 5,
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
  const poolsMap = compressV3PoolAccData(pools)

  v3PoolsAccDataCache.put(blockNumber.toString(), poolsMap)

  return poolsMap
}

export type PoolV2Detailed = PoolV2Base & {
  tvlUSD: {
    current: number
    '7D': number
    '24H': number
  }
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
      ({ tvlUSD, volumeUSD, txCount, ...pool }) =>
        ({
          ...pool,
          tvlUSD: {
            current: tvlUSD,
            '7D': tvlUSD - (pools7D[pool.id]?.[PoolV2AccDataCacheIndex.TVLUSD] ?? 0),
            '24H': tvlUSD - (pools24H[pool.id]?.[PoolV2AccDataCacheIndex.TVLUSD] ?? 0),
          },
          volumeUSD: {
            total: volumeUSD,
            '7D': volumeUSD - (pools7D[pool.id]?.[PoolV2AccDataCacheIndex.VOLUMEUSD] ?? 0),
            '24H': volumeUSD - (pools24H[pool.id]?.[PoolV2AccDataCacheIndex.VOLUMEUSD] ?? 0),
          },
          txCount: {
            total: txCount,
            '7D': txCount - (pools7D[pool.id]?.[PoolV2AccDataCacheIndex.TXCOUNT] ?? 0),
            '24H': txCount - (pools24H[pool.id]?.[PoolV2AccDataCacheIndex.TXCOUNT] ?? 0),
          },
        } as PoolV2Detailed),
    )
    .sort((a, b) => b.volumeUSD['24H'] - a.volumeUSD['24H'])

  return poolsDetails
}

export type PoolV3Detailed = PoolV3Base & {
  tvlUSD: {
    current: number
    '7D': number
    '24H': number
  }
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
    current: number
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
      ({ tvlUSD, volumeUSD, feeUSD, protocolFeeUSD, txCount, liquidityProviderCount, ...pool }) =>
        ({
          ...pool,
          tvlUSD: {
            current: tvlUSD,
            '7D': tvlUSD - (pools7D[pool.id]?.[PoolV3AccDataCacheIndex.TVLUSD] ?? 0),
            '24H': tvlUSD - (pools24H[pool.id]?.[PoolV3AccDataCacheIndex.TVLUSD] ?? 0),
          },
          volumeUSD: {
            total: volumeUSD,
            '7D': volumeUSD - (pools7D[pool.id]?.[PoolV3AccDataCacheIndex.VOLUMEUSD] ?? 0),
            '24H': volumeUSD - (pools24H[pool.id]?.[PoolV3AccDataCacheIndex.VOLUMEUSD] ?? 0),
          },
          feeUSD: {
            total: feeUSD,
            '7D': feeUSD - (pools7D[pool.id]?.[PoolV3AccDataCacheIndex.FEEUSD] ?? 0),
            '24H': feeUSD - (pools24H[pool.id]?.[PoolV3AccDataCacheIndex.FEEUSD] ?? 0),
          },
          protocolFeeUSD: {
            total: protocolFeeUSD,
            '7D': protocolFeeUSD - (pools7D[pool.id]?.[PoolV3AccDataCacheIndex.PROTOCOLFEEUSD] ?? 0),
            '24H': protocolFeeUSD - (pools24H[pool.id]?.[PoolV3AccDataCacheIndex.PROTOCOLFEEUSD] ?? 0),
          },
          txCount: {
            total: txCount,
            '7D': txCount - (pools7D[pool.id]?.[PoolV3AccDataCacheIndex.TXCOUNT] ?? 0),
            '24H': txCount - (pools24H[pool.id]?.[PoolV3AccDataCacheIndex.TXCOUNT] ?? 0),
          },
          liquidityProviderCount: {
            current: liquidityProviderCount,
            '7D': liquidityProviderCount - (pools7D[pool.id]?.[PoolV3AccDataCacheIndex.LIQUIDITYPROVIDERCOUNT] ?? 0),
            '24H': liquidityProviderCount - (pools24H[pool.id]?.[PoolV3AccDataCacheIndex.LIQUIDITYPROVIDERCOUNT] ?? 0),
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
  const [pools7D, pools24H, pools] = await Promise.all([
    getV2PoolsAccDataByIds({ poolIds, blockNumber: blockNumber7D }),
    getV2PoolsAccDataByIds({ poolIds, blockNumber: blockNumber24H }),
    requestWithRetry(poolsPromise, {
      logPrefix: `getV2PoolsDetailedDataByIds`,
    }),
  ])

  const poolsDetails = pools
    .map(
      ({ tvlUSD, volumeUSD, txCount, ...pool }) =>
        ({
          ...pool,
          tvlUSD: {
            current: tvlUSD,
            '7D': tvlUSD - (pools7D[pool.id]?.tvlUSD ?? 0),
            '24H': tvlUSD - (pools24H[pool.id]?.tvlUSD ?? 0),
          },
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
  const [pools7D, pools24H, pools] = await Promise.all([
    getV3PoolsAccDataByIds({ poolIds, blockNumber: blockNumber7D }),
    getV3PoolsAccDataByIds({ poolIds, blockNumber: blockNumber24H }),
    requestWithRetry(poolsPromise, {
      logPrefix: `getV3PoolsDetailedDataByIds`,
    }),
  ])

  const poolsDetails = pools
    .map(
      ({ tvlUSD, volumeUSD, feeUSD, protocolFeeUSD, txCount, liquidityProviderCount, ...pool }) =>
        ({
          ...pool,
          tvlUSD: {
            current: tvlUSD,
            '7D': tvlUSD - (pools7D[pool.id]?.tvlUSD ?? 0),
            '24H': tvlUSD - (pools24H[pool.id]?.tvlUSD ?? 0),
          },
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
            current: liquidityProviderCount,
            '7D': liquidityProviderCount - (pools7D[pool.id]?.liquidityProviderCount ?? 0),
            '24H': liquidityProviderCount - (pools24H[pool.id]?.liquidityProviderCount ?? 0),
          },
        } as PoolV3Detailed),
    )
    .sort((a, b) => b.volumeUSD['24H'] - a.volumeUSD['24H'])

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
