import { PoolParsed } from 'pages/api/pools'
import { DashboardPoolType } from 'pages/dashboard'
import { useMemo } from 'react'
import useSWR from 'swr'
import { SortDirection } from 'views/Dashboard/types'

function buildSearchParams({
  poolTypes,
  skip,
  addresses,
  tokenAddress,
  searchKey,
  sortBy,
  sortDirection,
}: Pick<
  UsePoolsParams,
  'poolTypes' | 'skip' | 'addresses' | 'tokenAddress' | 'searchKey' | 'sortBy' | 'sortDirection'
>) {
  const params = new URLSearchParams()
  if (poolTypes) {
    poolTypes.forEach((type) => params.append('types', type))
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

  if (addresses && addresses.length) {
    addresses.forEach((address) => params.append('onlyPoolIds', address))
  }

  if (tokenAddress) {
    params.set('tokenAddress', tokenAddress)
  }

  return params.toString()
}

export const POOLS_SORT_BY_LIST = ['apy24H', 'apy7D', 'volume24H', 'volume7D', 'tvl'] as const
export type PoolsSortBy = (typeof POOLS_SORT_BY_LIST)[number]

type UsePoolsParams = {
  poolTypes?: DashboardPoolType[]
  skip?: number
  addresses?: string[]
  tokenAddress?: string
  searchKey?: string
  sortBy?: PoolsSortBy
  sortDirection?: SortDirection
}
export default function usePools({
  poolTypes = ['v3'],
  skip,
  addresses,
  tokenAddress,
  searchKey,
  sortBy,
  sortDirection,
}: UsePoolsParams) {
  const params = buildSearchParams({ poolTypes, skip, addresses, tokenAddress, searchKey, sortBy, sortDirection })

  const { data, error } = useSWR(
    ['dashboard/pools', params],
    async () => {
      const res = await fetch(`/api/pools?${params}`)
      const parsed = (await res.json()) as { pools: PoolParsed[]; totalPage: number }

      return parsed
    },
    {
      refreshInterval: 1_000 * 60,
    },
  )

  return useMemo(
    () => ({
      poolsData: data?.pools,
      totalPage: data?.totalPage,
      poolsDataloading: !data && !error,
    }),
    [data, error],
  )
}
