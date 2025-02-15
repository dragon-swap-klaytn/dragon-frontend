import { DashboardPoolType } from 'pages/dashboard'

import useSWR from 'swr'
import { TokenDetailed } from 'tokens/get-cached-token-stats'
import { SortDirection } from 'views/Dashboard/types'

export const TOKENS_SORT_BY_LIST = ['priceChange24H', 'priceChange7D', 'volume24H', 'volume7D', 'tvl'] as const
export type TokensSortBy = (typeof TOKENS_SORT_BY_LIST)[number]

function buildSearchParams({
  addresses,
  skip,
  searchKey,
  sortBy,
  sortDirection,
}: Pick<UseTokensDataParams, 'addresses' | 'skip' | 'searchKey' | 'sortBy' | 'sortDirection'>) {
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
  poolType: DashboardPoolType
  searchKey?: string
  addresses?: string[]
  skip?: number
  sortBy?: TokensSortBy
  sortDirection?: SortDirection
}

type UseTokensDataOptions = {
  paused?: boolean
}

export default function useTokensData(
  { poolType = 'v3', searchKey, addresses, skip, sortBy, sortDirection }: UseTokensDataParams,
  { paused = false }: UseTokensDataOptions = {},
) {
  const params = buildSearchParams({ addresses, skip, searchKey, sortBy, sortDirection })

  const { data, error, isLoading } = useSWR(
    !paused ? `dashboard/stats/tokens/${poolType}?${params}` : null,
    async () => {
      const res = await fetch(`/api/stats/tokens/${poolType}?${params}`)
      const parsed = (await res.json()) as { tokens: TokenDetailed[]; totalPage: number }

      return parsed
    },
  )

  return {
    tokensData: data?.tokens,
    totalPage: data?.totalPage,
    error,
    isLoading,
  }
}
