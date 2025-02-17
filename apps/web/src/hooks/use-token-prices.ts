import useSWRImmutable from 'swr/immutable'
import { Address } from 'viem'

const sourceUrls = {
  default: '/api/tokens/prices',
  swapscanner: '/api/tokens/prices/ss',
}

export default function useTokenPrices({
  source = 'default',
}: {
  source?: 'default' | 'swapscanner'
} = {}) {
  const { data, error, mutate } = useSWRImmutable<Record<Address, number>>(
    sourceUrls[source],
    (key) => fetch(key).then((res) => res.json()),
    {
      refreshInterval: 1000 * 30,
    },
  )

  return {
    prices: data,
    mutate,
    error,
  }
}
