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
    params.set('addresses', addresses.join(','))
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

export default function useTokensData({
  poolType = 'v3',
  searchKey,
  addresses,
  skip,
  sortBy,
  sortDirection,
}: UseTokensDataParams) {
  const params = buildSearchParams({ addresses, skip, searchKey, sortBy, sortDirection })

  const {
    data: v3Stats,
    error: v3StatsError,
    isLoading,
  } = useSWR(
    poolType === 'v3' ? `dashboard/stats/tokens/v3?${params}` : null,
    async () => {
      const res = await fetch(`/api/stats/tokens/v3?${params}`)
      const parsed = (await res.json()) as { tokens: TokenDetailed[]; totalPage: number }

      return parsed
    },
    {
      refreshInterval: 1_000 * 60,
    },
  )

  const { data: v2Stats, error: v2StatsError } = useSWR(
    poolType === 'v2' ? `dashboard/stats/tokens/v2?${params}` : null,
    async () => {
      const res = await fetch(`/api/stats/tokens/v2?${params}`)
      const parsed = (await res.json()) as { tokens: TokenDetailed[]; totalPage: number }

      return parsed
    },
    {
      refreshInterval: 1_000 * 60,
    },
  )

  if (poolType === 'v3') {
    return {
      tokensData: v3Stats?.tokens,
      totalPage: v3Stats?.totalPage,
      tokensDataLoading: !v3Stats && !v3StatsError,
      isLoading,
    }
  }

  return {
    tokensData: v2Stats?.tokens,
    totalPage: v2Stats?.totalPage,
    tokensDataLoading: !v2Stats && !v2StatsError,
    isLoading,
  }
}
