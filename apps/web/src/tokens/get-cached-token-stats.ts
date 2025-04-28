import { getCachedBlockNumbers } from 'lib/get-cached-block-numbers'
import { getV2Tokens } from 'lib/graph-queries/get-v2-tokens'
import { getV3Tokens } from 'lib/graph-queries/get-v3-tokens'
import { TokenAccData, TokenBase } from 'lib/graph-queries/types'
import { TokenAccDataCache, v2TokensAccDataCache, v3TokensAccDataCache } from 'lru-caches'
import { PoolType } from 'types'
import { localCachedV2 } from 'utils/localCachedV2'
import { requestWithRetry } from 'utils/requestWithRetry'

const MINUTE = 60_000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

// FIXME: do we need threshold?
const TOKEN_LIQUIDITY_USD_THRESHOLD = 10

enum TokenAccDataCacheIndex {
  priceUSD = 0,
  tvl = 1,
  tvlUSD = 2,
  volume = 3,
  volumeUSD = 4,
  txCount = 5,
}

const compressTokenAccData = (tokens: TokenAccData[]): TokenAccDataCache => {
  return Object.fromEntries(
    tokens.map(({ id, priceUSD, tvl, tvlUSD, volume, volumeUSD, txCount }) => [
      id,
      [priceUSD, tvl, tvlUSD, volume, volumeUSD, txCount],
    ]),
  )
}

export const getV2TokensAccData = async (blockNumber: number) => {
  // check lru cache
  if (v2TokensAccDataCache.get(blockNumber.toString())) {
    return v2TokensAccDataCache.get(blockNumber.toString())!
  }

  // fetch data
  const tokensPromise = getV2Tokens({ blockNumber, accOnly: true })
  const tokens = await requestWithRetry(tokensPromise, {
    logPrefix: `getV2TokensAccData(${blockNumber})`,
  })

  // cache data
  const tokensMap = compressTokenAccData(tokens)

  v2TokensAccDataCache.put(blockNumber.toString(), tokensMap)

  return tokensMap
}

export const getV3TokensAccData = async (blockNumber: number) => {
  // check lru cache
  if (v3TokensAccDataCache.get(blockNumber.toString())) {
    return v3TokensAccDataCache.get(blockNumber.toString())!
  }

  // fetch data
  const tokensPromise = getV3Tokens({ blockNumber, accOnly: true })
  const tokens = await requestWithRetry(tokensPromise, {
    logPrefix: `getV3TokensAccData(${blockNumber})`,
  })

  // cache data
  const tokensMap = compressTokenAccData(tokens)

  v3TokensAccDataCache.put(blockNumber.toString(), tokensMap)

  return tokensMap
}

export type TokenDetailed = TokenBase & {
  type: PoolType
  priceUSD: {
    current: number
    '7D': number | null
    '24H': number | null
  }
  tvl: {
    current: number
    '7D': number | null
    '24H': number | null
  }
  tvlUSD: {
    current: number
    '7D': number | null
    '24H': number | null
  }
  volume: {
    total: number
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

const getV2TokensDatailedData = async () => {
  const now = Date.now()
  const timestamps = [now - 7 * DAY, now - DAY, now]
  const blockNumbers = await getCachedBlockNumbers(timestamps)

  const tokensPromise = getV2Tokens({ blockNumber: blockNumbers[2] })
  const [_tokens7D, _tokens24H, _tokens] = await Promise.allSettled([
    getV2TokensAccData(blockNumbers[0]),
    getV2TokensAccData(blockNumbers[1]),
    requestWithRetry(tokensPromise, {
      logPrefix: `getV2TokensDatailedData(${blockNumbers[2]})`,
    }),
  ])

  const tokens7D = _tokens7D.status === 'fulfilled' ? _tokens7D.value : {}
  const tokens24H = _tokens24H.status === 'fulfilled' ? _tokens24H.value : {}
  const tokens = _tokens.status === 'fulfilled' ? _tokens.value : []

  const tokensDetailed = tokens
    .filter(({ tvlUSD }) => tvlUSD > TOKEN_LIQUIDITY_USD_THRESHOLD)
    .map(
      ({ priceUSD, tvl, tvlUSD, volume, volumeUSD, txCount, ...token }) =>
        ({
          ...token,
          type: 'v2',
          priceUSD: {
            current: priceUSD,
            '7D': !tokens7D[token.id]?.[TokenAccDataCacheIndex.priceUSD]
              ? null
              : priceUSD - tokens7D[token.id][TokenAccDataCacheIndex.priceUSD],
            '24H': !tokens24H[token.id]?.[TokenAccDataCacheIndex.priceUSD]
              ? null
              : priceUSD - tokens24H[token.id][TokenAccDataCacheIndex.priceUSD],
          },
          tvl: {
            current: tvl,
            '7D': !tokens7D[token.id]?.[TokenAccDataCacheIndex.tvl]
              ? null
              : tvl - tokens7D[token.id][TokenAccDataCacheIndex.tvl],
            '24H': !tokens24H[token.id]?.[TokenAccDataCacheIndex.tvl]
              ? null
              : tvl - tokens24H[token.id][TokenAccDataCacheIndex.tvl],
          },
          tvlUSD: {
            current: tvlUSD,
            '7D': !tokens7D[token.id]?.[TokenAccDataCacheIndex.tvlUSD]
              ? null
              : tvlUSD - tokens7D[token.id][TokenAccDataCacheIndex.tvlUSD],
            '24H': !tokens24H[token.id]?.[TokenAccDataCacheIndex.tvlUSD]
              ? null
              : tvlUSD - tokens24H[token.id][TokenAccDataCacheIndex.tvlUSD],
          },
          volume: {
            total: volume,
            '7D': !tokens7D[token.id]?.[TokenAccDataCacheIndex.volume]
              ? null
              : volume - tokens7D[token.id][TokenAccDataCacheIndex.volume],
            '24H': !tokens24H[token.id]?.[TokenAccDataCacheIndex.volume]
              ? null
              : volume - tokens24H[token.id][TokenAccDataCacheIndex.volume],
          },
          volumeUSD: {
            total: volumeUSD,
            '7D': !tokens7D[token.id]?.[TokenAccDataCacheIndex.volumeUSD]
              ? null
              : volumeUSD - tokens7D[token.id][TokenAccDataCacheIndex.volumeUSD],
            '24H': !tokens24H[token.id]?.[TokenAccDataCacheIndex.volumeUSD]
              ? null
              : volumeUSD - tokens24H[token.id][TokenAccDataCacheIndex.volumeUSD],
          },
          txCount: {
            total: txCount,
            '7D': !tokens7D[token.id]?.[TokenAccDataCacheIndex.txCount]
              ? null
              : txCount - tokens7D[token.id][TokenAccDataCacheIndex.txCount],
            '24H': !tokens24H[token.id]?.[TokenAccDataCacheIndex.txCount]
              ? null
              : txCount - tokens24H[token.id][TokenAccDataCacheIndex.txCount],
          },
        } as TokenDetailed),
    )
    .sort((a, b) => (b.volumeUSD['24H'] ?? 0) - (a.volumeUSD['24H'] ?? 0))

  return tokensDetailed
}

export const getCachedV2TokenStats = localCachedV2(getV2TokensDatailedData, {
  staleWhileRevalidate: true,
  ttl: 10 * MINUTE,
  ttlOnCatch: 5_000,
}).cachedFetcher

const getV3TokensDatailedData = async () => {
  const now = Date.now()
  const timestamps = [now - 7 * DAY, now - DAY, now]
  const blockNumbers = await getCachedBlockNumbers(timestamps)

  const tokensPromise = getV3Tokens({ blockNumber: blockNumbers[2] })
  const [_tokens7D, _tokens24H, _tokens] = await Promise.allSettled([
    getV3TokensAccData(blockNumbers[0]),
    getV3TokensAccData(blockNumbers[1]),
    requestWithRetry(tokensPromise, {
      logPrefix: `getV3TokensDatailedData(${blockNumbers[2]})`,
    }),
  ])

  const tokens7D = _tokens7D.status === 'fulfilled' ? _tokens7D.value : {}
  const tokens24H = _tokens24H.status === 'fulfilled' ? _tokens24H.value : {}
  const tokens = _tokens.status === 'fulfilled' ? _tokens.value : []

  const tokensDetailed = tokens
    .filter(({ tvlUSD }) => tvlUSD > TOKEN_LIQUIDITY_USD_THRESHOLD)
    .map(
      ({ priceUSD, tvl, tvlUSD, volume, volumeUSD, txCount, ...token }) =>
        ({
          ...token,
          type: 'v3',
          priceUSD: {
            current: priceUSD,
            '7D': !tokens7D[token.id]?.[TokenAccDataCacheIndex.priceUSD]
              ? null
              : priceUSD - tokens7D[token.id][TokenAccDataCacheIndex.priceUSD],
            '24H': !tokens7D[token.id]?.[TokenAccDataCacheIndex.priceUSD]
              ? null
              : priceUSD - tokens24H[token.id][TokenAccDataCacheIndex.priceUSD],
          },
          tvl: {
            current: tvl,
            '7D': !tokens7D[token.id]?.[TokenAccDataCacheIndex.tvl]
              ? null
              : tvl - tokens7D[token.id][TokenAccDataCacheIndex.tvl],
            '24H': !tokens24H[token.id]?.[TokenAccDataCacheIndex.tvl]
              ? null
              : tvl - tokens24H[token.id][TokenAccDataCacheIndex.tvl],
          },
          tvlUSD: {
            current: tvlUSD,
            '7D': !tokens7D[token.id]?.[TokenAccDataCacheIndex.tvlUSD]
              ? null
              : tvlUSD - tokens7D[token.id][TokenAccDataCacheIndex.tvlUSD],
            '24H': !tokens24H[token.id]?.[TokenAccDataCacheIndex.tvlUSD]
              ? null
              : tvlUSD - tokens24H[token.id][TokenAccDataCacheIndex.tvlUSD],
          },
          volume: {
            total: volume,
            '7D': !tokens7D[token.id]?.[TokenAccDataCacheIndex.volume]
              ? null
              : volume - tokens7D[token.id][TokenAccDataCacheIndex.volume],
            '24H': !tokens24H[token.id]?.[TokenAccDataCacheIndex.volume]
              ? null
              : volume - tokens24H[token.id][TokenAccDataCacheIndex.volume],
          },
          volumeUSD: {
            total: volumeUSD,
            '7D': !tokens7D[token.id]?.[TokenAccDataCacheIndex.volumeUSD]
              ? null
              : volumeUSD - tokens7D[token.id][TokenAccDataCacheIndex.volumeUSD],
            '24H': !tokens24H[token.id]?.[TokenAccDataCacheIndex.volumeUSD]
              ? null
              : volumeUSD - tokens24H[token.id][TokenAccDataCacheIndex.volumeUSD],
          },
          txCount: {
            total: txCount,
            '7D': !tokens7D[token.id]?.[TokenAccDataCacheIndex.txCount]
              ? null
              : txCount - tokens7D[token.id][TokenAccDataCacheIndex.txCount],
            '24H': !tokens24H[token.id]?.[TokenAccDataCacheIndex.txCount]
              ? null
              : txCount - tokens24H[token.id][TokenAccDataCacheIndex.txCount],
          },
        } as TokenDetailed),
    )
    .sort((a, b) => (b.volumeUSD['24H'] ?? 0) - (a.volumeUSD['24H'] ?? 0))

  return tokensDetailed
}

export const getCachedV3TokenStats = localCachedV2(getV3TokensDatailedData, {
  staleWhileRevalidate: true,
  ttl: 10 * MINUTE,
  ttlOnCatch: 5_000,
}).cachedFetcher
