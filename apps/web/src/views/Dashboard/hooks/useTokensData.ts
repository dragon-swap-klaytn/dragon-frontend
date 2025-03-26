import { useDebounce } from '@pancakeswap/hooks'
import useSWR from 'swr'
import { TokenDetailed } from 'tokens/get-cached-token-stats'
import { PoolType } from 'types'
import { SortDirection } from 'views/Dashboard/types'
import { wkaiaToKaia } from 'views/Dashboard/utils/wkaiaToKaia'

export const TOKENS_SORT_BY_LIST = ['priceChange24H', 'priceChange7D', 'volume24H', 'volume7D', 'tvl'] as const
export type TokensSortBy = (typeof TOKENS_SORT_BY_LIST)[number]

export function buildUseTokensSearchParams({
  searchKey,
  addresses,
  skip,
  sortBy,
  sortDirection,
}: {
  searchKey?: string
  addresses?: string[]
  skip?: number
  sortBy?: TokensSortBy
  sortDirection?: SortDirection
}) {
  const params = new URLSearchParams()

  if (addresses) {
    params.set('onlyTokenAddresses', addresses.join(','))
  }

  if (sortBy) {
    params.set('sortBy', sortBy)
  }

  if (sortDirection) {
    params.set('sortDirection', sortDirection)
  }

  if (searchKey) {
    params.set('searchKey', searchKey)
  }

  if (skip) {
    params.set('skip', skip.toString())
  }

  return params.toString()
}

type UseTokensDataParams = {
  poolType?: PoolType
  query: string
}

type UseTokensDataOptions = {
  paused?: boolean
}

export default function useTokensData(
  { poolType = 'v3', query }: UseTokensDataParams,
  { paused = false }: UseTokensDataOptions = {},
) {
  const debouncedParams = useDebounce(query, 500)

  const { data, error, isLoading } = useSWR(
    paused || !debouncedParams || query !== debouncedParams ? null : ['dashboard/tokens', poolType, debouncedParams],
    async () => {
      const res = await fetch(`/api/stats/tokens/${poolType}?${debouncedParams}`)
      const parsed = (await res.json()) as { tokens: TokenDetailed[]; totalPage: number }

      return parsed
    },
  )

  return {
    tokensData: data?.tokens ? data.tokens.map(wkaiaToKaia) : undefined,
    totalPage: data?.totalPage,
    error,
    isLoading,
  }
}
