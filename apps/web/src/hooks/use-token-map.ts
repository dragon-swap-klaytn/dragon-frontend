import fetcher from 'lib/fetcher'
import useSWR from 'swr'

type TokenMap = {
  [address: string]: {
    address: string
    symbol: string
    name: string
    decimals: string
  }
}

export default function useTokenMap() {
  const {
    data: tokenMap,
    error: tokenMapError,
    mutate: mutateTokenMap,
  } = useSWR<TokenMap>('https://api.swapscanner.io/api/v0/tokens', fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    refreshInterval: 60 * 1_000,
  })

  return {
    tokenMap,
    tokenMapError,
    mutateTokenMap,
    tokenMapLoading: !tokenMap && !tokenMapError,
  }
}
