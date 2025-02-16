import useSWR from 'swr'
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
  const { data, error, mutate } = useSWR<Record<Address, number>>(sourceUrls[source], (key) =>
    fetch(key).then((res) => res.json()),
  )

  return {
    prices: data,
    mutate,
    error,
  }
}
