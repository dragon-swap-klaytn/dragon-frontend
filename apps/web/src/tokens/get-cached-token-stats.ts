import { getCachedBlockNumbers } from 'lib/get-cached-block-numbers'
import { getV2Tokens } from 'lib/graph-queries/get-v2-tokens'
import { getV3Tokens } from 'lib/graph-queries/get-v3-tokens'
import { TokenBase } from 'lib/graph-queries/types'
import { v2TokensAccDataCache, v3TokensAccDataCache } from 'lru-caches'
import { PoolType } from 'types'
import { localCachedV2 } from 'utils/localCachedV2'
import { requestWithRetry } from 'utils/requestWithRetry'

const MINUTE = 60_000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

// FIXME: do we need threshold?
const TOKEN_LIQUIDITY_USD_THRESHOLD = 10

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
  const tokensMap = Object.fromEntries(tokens.map(({ id, ...token }) => [id, token]))

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
  const tokensMap = Object.fromEntries(tokens.map(({ id, ...token }) => [id, token]))

  v3TokensAccDataCache.put(blockNumber.toString(), tokensMap)

  return tokensMap
}

export type TokenDetailed = TokenBase & {
  type: PoolType
  priceUSD: {
    current: number
    '7D': number
    '24H': number
  }
  tvl: {
    current: number
    '7D': number
    '24H': number
  }
  tvlUSD: {
    current: number
    '7D': number
    '24H': number
  }
  volume: {
    total: number
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

const getV2TokensDatailedData = async () => {
  const now = Date.now()
  const timestamps = [now - 7 * DAY, now - DAY, now]
  const blockNumbers = await getCachedBlockNumbers(timestamps)

  const tokensPromise = getV2Tokens({ blockNumber: blockNumbers[2] })
  const [tokens7D, tokens24H, tokens] = await Promise.all([
    getV2TokensAccData(blockNumbers[0]),
    getV2TokensAccData(blockNumbers[1]),
    requestWithRetry(tokensPromise, {
      logPrefix: `getV2TokensDatailedData(${blockNumbers[2]})`,
    }),
  ])

  const tokensDetailed = tokens
    .filter(({ tvlUSD }) => tvlUSD > TOKEN_LIQUIDITY_USD_THRESHOLD)
    .map(
      ({ priceUSD, tvl, tvlUSD, volume, volumeUSD, txCount, ...token }) =>
        ({
          ...token,
          type: 'v2',
          priceUSD: {
            current: priceUSD,
            '7D': priceUSD - (tokens7D[token.id]?.priceUSD ?? 0),
            '24H': priceUSD - (tokens24H[token.id]?.priceUSD ?? 0),
          },
          tvl: {
            current: tvl,
            '7D': tvl - (tokens7D[token.id]?.tvl ?? 0),
            '24H': tvl - (tokens24H[token.id]?.tvl ?? 0),
          },
          tvlUSD: {
            current: tvlUSD,
            '7D': tvlUSD - (tokens7D[token.id]?.tvlUSD ?? 0),
            '24H': tvlUSD - (tokens24H[token.id]?.tvlUSD ?? 0),
          },
          volume: {
            total: volume,
            '7D': volume - (tokens7D[token.id]?.volume ?? 0),
            '24H': volume - (tokens24H[token.id]?.volume ?? 0),
          },
          volumeUSD: {
            total: volumeUSD,
            '7D': volumeUSD - (tokens7D[token.id]?.volumeUSD ?? 0),
            '24H': volumeUSD - (tokens24H[token.id]?.volumeUSD ?? 0),
          },
          txCount: {
            total: txCount,
            '7D': txCount - (tokens7D[token.id]?.txCount ?? 0),
            '24H': txCount - (tokens24H[token.id]?.txCount ?? 0),
          },
        } as TokenDetailed),
    )
    .sort((a, b) => b.volumeUSD['24H'] - a.volumeUSD['24H'])

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
  const [tokens7D, tokens24H, tokens] = await Promise.all([
    getV3TokensAccData(blockNumbers[0]),
    getV3TokensAccData(blockNumbers[1]),
    requestWithRetry(tokensPromise, {
      logPrefix: `getV3TokensDatailedData(${blockNumbers[2]})`,
    }),
  ])

  const tokensDetailed = tokens
    .filter(({ tvlUSD }) => tvlUSD > TOKEN_LIQUIDITY_USD_THRESHOLD)
    .map(
      ({ priceUSD, tvl, tvlUSD, volume, volumeUSD, txCount, ...token }) =>
        ({
          ...token,
          type: 'v3',
          priceUSD: {
            current: priceUSD,
            '7D': priceUSD - (tokens7D[token.id]?.priceUSD ?? 0),
            '24H': priceUSD - (tokens24H[token.id]?.priceUSD ?? 0),
          },
          tvl: {
            current: tvl,
            '7D': tvl - (tokens7D[token.id]?.tvl ?? 0),
            '24H': tvl - (tokens24H[token.id]?.tvl ?? 0),
          },
          tvlUSD: {
            current: tvlUSD,
            '7D': tvlUSD - (tokens7D[token.id]?.tvlUSD ?? 0),
            '24H': tvlUSD - (tokens24H[token.id]?.tvlUSD ?? 0),
          },
          volume: {
            total: volume,
            '7D': volume - (tokens7D[token.id]?.volume ?? 0),
            '24H': volume - (tokens24H[token.id]?.volume ?? 0),
          },
          volumeUSD: {
            total: volumeUSD,
            '7D': volumeUSD - (tokens7D[token.id]?.volumeUSD ?? 0),
            '24H': volumeUSD - (tokens24H[token.id]?.volumeUSD ?? 0),
          },
          txCount: {
            total: txCount,
            '7D': txCount - (tokens7D[token.id]?.txCount ?? 0),
            '24H': txCount - (tokens24H[token.id]?.txCount ?? 0),
          },
        } as TokenDetailed),
    )
    .sort((a, b) => b.volumeUSD['24H'] - a.volumeUSD['24H'])

  return tokensDetailed
}

export const getCachedV3TokenStats = localCachedV2(getV3TokensDatailedData, {
  staleWhileRevalidate: true,
  ttl: 10 * MINUTE,
  ttlOnCatch: 5_000,
}).cachedFetcher
