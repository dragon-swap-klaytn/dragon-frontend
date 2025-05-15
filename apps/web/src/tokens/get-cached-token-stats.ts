import { getCachedBlockNumbers } from 'lib/get-cached-block-numbers'
import { getV2Tokens } from 'lib/graph-queries/get-v2-tokens'
import { getV3Tokens } from 'lib/graph-queries/get-v3-tokens'
import { TokenAccData, TokenDetailed } from 'lib/graph-queries/types'
import { TokenAccDataCache, v2TokensAccDataCache, v3TokensAccDataCache } from 'lru-caches'
import { v2TokensAccDataMongoCache, v3TokensAccDataMongoCache } from 'mongo-caches'
import { localCachedProactiveV2 } from 'utils/local-cached-proactive-v2'
import { localCachedV2 } from 'utils/localCachedV2'
import { requestWithRetry } from 'utils/requestWithRetry'

const USE_MONGO_CACHE = process.env.USE_MONGO_CACHE === 'true' && !!process.env.MONGODB

const TIMESTAMP_GUTTER = 30 * 1000 // 30 seconds

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
  if (USE_MONGO_CACHE) {
    const v2Tokens = await v2TokensAccDataMongoCache.get(blockNumber)
    if (v2Tokens) {
      return v2Tokens
    }
    // check lru cache
  } else if (v2TokensAccDataCache.get(blockNumber.toString())) {
    return v2TokensAccDataCache.get(blockNumber.toString())!
  }

  // fetch data
  const tokensPromise = getV2Tokens({ blockNumber, accOnly: true })
  const tokens = await requestWithRetry(tokensPromise, {
    logPrefix: `getV2TokensAccData(${blockNumber})`,
  })

  // cache data
  const tokensMap = compressTokenAccData(tokens)

  if (USE_MONGO_CACHE) {
    await v2TokensAccDataMongoCache.put(blockNumber, tokensMap)
  } else {
    v2TokensAccDataCache.put(blockNumber.toString(), tokensMap)
  }

  return tokensMap
}

export const getV3TokensAccData = async (blockNumber: number) => {
  if (USE_MONGO_CACHE) {
    const v3Tokens = await v3TokensAccDataMongoCache.get(blockNumber)
    if (v3Tokens) {
      return v3Tokens
    }
    // check lru cache
  } else if (v3TokensAccDataCache.get(blockNumber.toString())) {
    return v3TokensAccDataCache.get(blockNumber.toString())!
  }

  // fetch data
  const tokensPromise = getV3Tokens({ blockNumber, accOnly: true })
  const tokens = await requestWithRetry(tokensPromise, {
    logPrefix: `getV3TokensAccData(${blockNumber})`,
  })

  // cache data
  const tokensMap = compressTokenAccData(tokens)

  if (USE_MONGO_CACHE) {
    await v3TokensAccDataMongoCache.put(blockNumber, tokensMap)
  } else {
    v3TokensAccDataCache.put(blockNumber.toString(), tokensMap)
  }

  return tokensMap
}

const getProactivelyCachedV2TokensData = localCachedProactiveV2(
  async () => {
    try {
      const [blockNumber] = await getCachedBlockNumbers([Date.now() - TIMESTAMP_GUTTER])
      const tokens = await requestWithRetry(getV2Tokens({ blockNumber }), {
        logPrefix: `getV2TokensDatailedData(${blockNumber})`,
      })

      // cache data
      const compressedTokens = compressTokenAccData(tokens)

      if (USE_MONGO_CACHE) {
        await v2TokensAccDataMongoCache.put(blockNumber, compressedTokens)
      } else {
        v2TokensAccDataCache.put(blockNumber.toString(), compressedTokens)
      }

      return tokens
    } catch (err) {
      console.warn('Error in getProactivelyCachedV2TokensData:', err)

      return requestWithRetry(getV2Tokens(), {
        logPrefix: 'getV2TokensDatailedData(catch)',
      })
    }
  },
  {
    interval: USE_MONGO_CACHE ? 3 * MINUTE : 5 * MINUTE,
    logPrefix: 'getProactivelyCachedV2TokensData',
  },
).getData

const getV2TokensDatailedData = async () => {
  const now = Date.now()
  const timestamps = [now - 7 * DAY, now - DAY]
  const blockNumbers = await getCachedBlockNumbers(timestamps)

  const [_tokens7D, _tokens24H, _tokens] = await Promise.allSettled([
    getV2TokensAccData(blockNumbers[0]),
    getV2TokensAccData(blockNumbers[1]),
    getProactivelyCachedV2TokensData(),
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
  ttl: 5 * MINUTE,
  ttlOnCatch: 5_000,
}).cachedFetcher

const getProactivelyCachedV3TokensData = localCachedProactiveV2(
  async () => {
    try {
      const [blockNumber] = await getCachedBlockNumbers([Date.now() - TIMESTAMP_GUTTER])
      const tokens = await requestWithRetry(getV3Tokens({ blockNumber }), {
        logPrefix: `getV3TokensDatailedData(${blockNumber})`,
      })

      // cache data
      const compressedTokens = compressTokenAccData(tokens)

      if (USE_MONGO_CACHE) {
        await v3TokensAccDataMongoCache.put(blockNumber, compressedTokens)
      } else {
        v3TokensAccDataCache.put(blockNumber.toString(), compressedTokens)
      }

      return tokens
    } catch (err) {
      console.warn('Error in getProactivelyCachedV3TokensData:', err)

      return requestWithRetry(getV3Tokens(), {
        logPrefix: 'getV3TokensDatailedData(catch)',
      })
    }
  },
  {
    interval: USE_MONGO_CACHE ? 3 * MINUTE : 5 * MINUTE,
    logPrefix: 'getProactivelyCachedV3TokensData',
  },
).getData

const getV3TokensDatailedData = async () => {
  const now = Date.now()
  const timestamps = [now - 7 * DAY, now - DAY]
  const blockNumbers = await getCachedBlockNumbers(timestamps)

  const [_tokens7D, _tokens24H, _tokens] = await Promise.allSettled([
    getV3TokensAccData(blockNumbers[0]),
    getV3TokensAccData(blockNumbers[1]),
    getProactivelyCachedV3TokensData(),
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

export const getCachedV3TokenStats = localCachedV2(getV3TokensDatailedData, {
  staleWhileRevalidate: true,
  ttl: 5 * MINUTE,
  ttlOnCatch: 5_000,
}).cachedFetcher
