import { getCachedBlockNumbers } from 'lib/get-cached-block-numbers'
import { getV2FactoryData } from 'lib/graph-queries/get-v2-factory-data'
import { getV3FactoryData } from 'lib/graph-queries/get-v3-factory-data'
import { FactoryDataV2Raw, FactoryDataV3Raw } from 'lib/graph-queries/types'
import { localCachedV2 } from 'utils/localCachedV2'
import { requestWithRetry } from 'utils/requestWithRetry'

const MINUTE = 60_000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

export type ProtocolV2Data = {
  poolCount: {
    current: number
    '48H': number | null
    '24H': number | null
  }
  txCount: {
    total: number
    '48H': number | null
    '24H': number | null
  }
  volumeUSD: {
    total: number
    '48H': number | null
    '24H': number | null
  }
  tvlUSD: {
    current: number
    '48H': number | null
    '24H': number | null
  }
}

const getV2ProtocolData = async () => {
  const now = Date.now()
  const timestamps = [now - 2 * DAY, now - DAY, now]
  const blockNumbers = await getCachedBlockNumbers(timestamps)

  const [_data48H, _data24H, _data] = await Promise.allSettled(
    blockNumbers.map((blockNumber) =>
      requestWithRetry(getV2FactoryData({ blockNumber }), {
        logPrefix: `getV2ProtocolData(${blockNumber})`,
      }),
    ),
  )

  const data48H = _data48H.status === 'fulfilled' ? _data48H.value : ({} as FactoryDataV2Raw)
  const data24H = _data24H.status === 'fulfilled' ? _data24H.value : ({} as FactoryDataV2Raw)
  const data = _data.status === 'fulfilled' ? _data.value : ({} as FactoryDataV2Raw)

  return {
    poolCount: {
      current: data.poolCount,
      '48H': data48H.poolCount,
      '24H': data24H.poolCount,
    },
    txCount: {
      total: data.txCount,
      '48H': data48H.txCount,
      '24H': data24H.txCount,
    },
    volumeUSD: {
      total: data.volumeUSD,
      '48H': data48H.volumeUSD,
      '24H': data24H.volumeUSD,
    },
    tvlUSD: {
      current: data.tvlUSD,
      '48H': data48H.tvlUSD,
      '24H': data24H.tvlUSD,
    },
  }
}

export const getCachedV2ProtocolData = localCachedV2(getV2ProtocolData, {
  staleWhileRevalidate: true,
  ttl: 10 * MINUTE,
  ttlOnCatch: 5_000,
}).cachedFetcher

export type ProtocolV3Data = ProtocolV2Data & {
  feeUSD: {
    total: number
    '48H': number | null
    '24H': number | null
  }
  protocolFeeUSD: {
    total: number
    '48H': number | null
    '24H': number | null
  }
}

const getV3ProtocolData = async () => {
  const now = Date.now()
  const timestamps = [now - 2 * DAY, now - DAY, now]
  const blockNumbers = await getCachedBlockNumbers(timestamps)

  const [_data48H, _data24H, _data] = await Promise.allSettled(
    blockNumbers.map((blockNumber) =>
      requestWithRetry(getV3FactoryData({ blockNumber }), {
        logPrefix: `getV3ProtocolData(${blockNumber})`,
      }),
    ),
  )

  const data48H = _data48H.status === 'fulfilled' ? _data48H.value : ({} as FactoryDataV3Raw)
  const data24H = _data24H.status === 'fulfilled' ? _data24H.value : ({} as FactoryDataV3Raw)
  const data = _data.status === 'fulfilled' ? _data.value : ({} as FactoryDataV3Raw)

  return {
    poolCount: {
      current: data.poolCount,
      '48H': data48H.poolCount,
      '24H': data24H.poolCount,
    },
    txCount: {
      total: data.txCount,
      '48H': data48H.txCount,
      '24H': data24H.txCount,
    },
    volumeUSD: {
      total: data.volumeUSD,
      '48H': data48H.volumeUSD,
      '24H': data24H.volumeUSD,
    },
    tvlUSD: {
      current: data.tvlUSD,
      '48H': data48H.tvlUSD,
      '24H': data24H.tvlUSD,
    },
    feeUSD: {
      total: data.feeUSD,
      '48H': data48H.feeUSD,
      '24H': data24H.feeUSD,
    },
    protocolFeeUSD: {
      total: data.protocolFeeUSD,
      '48H': data48H.protocolFeeUSD,
      '24H': data24H.protocolFeeUSD,
    },
  }
}

export const getCachedV3ProtocolData = localCachedV2(getV3ProtocolData, {
  staleWhileRevalidate: true,
  ttl: 10 * MINUTE,
  ttlOnCatch: 5_000,
}).cachedFetcher
