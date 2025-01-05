import fetcher from 'lib/fetcher'
import useSWR from 'swr'

// "0x0000000000000000000000000000000000000000": {
//     "address": "0x0000000000000000000000000000000000000000",
//     "symbol": "KAIA",
//     "name": "Kaia",
//     "decimals": "18"
//   }

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

  // const tokenAddressToToken = useMemo<TokenMap>(() => {
  //   if (!tokens) return {}

  //   return Object.fromEntries(tokens.map((t) => [t.address, t]))
  // }, [tokens])

  return {
    tokenMap,
    tokenMapError,
    mutateTokenMap,
    tokenMapLoading: !tokenMap && !tokenMapError,
  }
}
