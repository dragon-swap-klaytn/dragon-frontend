import { localCachedV2 } from 'utils/localCachedV2'

export const getTokenPricesFromSwapscanner = async () => {
  const res = await fetch('https://api.swapscanner.io/v1/tokens/prices')

  if (!res.ok) {
    throw new Error('Failed to fetch token prices from swapscanner')
  }

  return res.json()
}

export const getFilteredTokenPricesFromSwapscanner = async () => {
  const res = await fetch('https://api.swapscanner.io/api/tokens/filtered')

  if (!res.ok) {
    throw new Error('Failed to fetch token prices from swapscanner')
  }

  const data = res.json()

  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => {
      return [key, value.priceUSD]
    }),
  )
}

export const getCachedTokenPricesFromSwapscanner = localCachedV2(
  async () => {
    const [prices, filteredPrices] = await Promise.all([
      getTokenPricesFromSwapscanner(),
      getFilteredTokenPricesFromSwapscanner(),
    ])

    return {
      ...prices,
      ...filteredPrices,
    }
  },
  {
    staleWhileRevalidate: true,
    ttl: 60 * 1000,
    ttlOnCatch: 60 * 1000,
  },
).cachedFetcher
