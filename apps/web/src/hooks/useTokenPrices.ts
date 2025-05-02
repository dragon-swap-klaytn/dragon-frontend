import useSWRImmutable from 'swr/immutable'
import { duplicateChecksumPriceMap } from 'utils/duplicate-checksum-price-map'

const sourceUrls = {
  default: '/api/tokens/prices',
  swapscanner: '/api/tokens/prices/ss',
}

export const getTokenPrices = async (source: 'default' | 'swapscanner' = 'default') => {
  const data = await fetch(sourceUrls[source])
  const parsed = await data.json()
  return duplicateChecksumPriceMap(parsed)
}

export default function useTokenPrices({
  source = 'default',
  refreshInterval = 1000 * 30,
}: {
  source?: 'default' | 'swapscanner'
  refreshInterval?: number
} = {}) {
  const { data, error, mutate, isLoading } = useSWRImmutable<Record<string, number>>(
    sourceUrls[source],
    (key) => fetch(key).then((res) => res.json()),
    {
      refreshInterval,
    },
  )

  return {
    prices: data ? duplicateChecksumPriceMap(data) : undefined,
    mutate,
    error,
    pricesLoading: isLoading,
  }
}
