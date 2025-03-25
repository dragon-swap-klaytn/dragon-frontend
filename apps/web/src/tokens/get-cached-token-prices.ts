import { ChainId } from '@pancakeswap/chains'
import { CAKE } from '@pancakeswap/tokens'
import { getCachedBlockNumbers } from 'lib/get-cached-block-numbers'
import { WKLAY_ADDRESS } from 'lib/graph-queries/const'
import { getV2TokensAccData, getV3TokensAccData } from 'tokens/get-cached-token-stats'
import { localCachedV2 } from 'utils/localCachedV2'

const MINUTE = 60_000

const getTokenPrices = async () => {
  const now = Date.now()
  const [blockNumber] = await getCachedBlockNumbers([now])
  const [v2TokensAccData, v3TokensAccData] = await Promise.all([
    getV2TokensAccData(blockNumber),
    getV3TokensAccData(blockNumber),
  ])

  const tokens: Record<
    string,
    {
      prices: Array<{
        price: number
        tvl: number
      }>
    }
  > = {}
  for (const [id, [priceUSD, _tvl, tvlUSD]] of Object.entries(v2TokensAccData)) {
    if (!priceUSD || !tvlUSD) {
      continue
    }

    tokens[id] = {
      prices: [{ price: priceUSD, tvl: tvlUSD }],
    }
  }

  for (const [id, [priceUSD, _tvl, tvlUSD]] of Object.entries(v3TokensAccData)) {
    if (!priceUSD || !tvlUSD) {
      continue
    }

    if (!tokens[id]) {
      tokens[id] = {
        prices: [{ price: priceUSD, tvl: tvlUSD }],
      }
    } else {
      tokens[id].prices.push({ price: priceUSD, tvl: tvlUSD })
    }
  }

  const avgPrices = Object.fromEntries(
    Object.entries(tokens)
      .map(([id, { prices }]) => {
        const denominator = prices.reduce((acc, { tvl }) => acc + tvl ** 2, 0)
        const numerator = prices.reduce((acc, { price, tvl }) => acc + price * tvl ** 2, 0)

        return [id, numerator / denominator] as const
      })
      .sort((a, b) => a[0].localeCompare(b[0])),
  )

  // explicitly add KAIA price
  avgPrices.KAIA = avgPrices[WKLAY_ADDRESS]
  // explicitly add RKLAY price
  avgPrices[CAKE[ChainId.KLAYTN].address.toLowerCase()] = avgPrices[WKLAY_ADDRESS]

  return avgPrices
}

export const getCachedTokenPrices = localCachedV2(getTokenPrices, {
  staleWhileRevalidate: true,
  ttl: 5 * MINUTE,
  ttlOnCatch: 5_000,
}).cachedFetcher
