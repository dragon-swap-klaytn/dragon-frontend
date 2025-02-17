import { PoolParsed } from 'pages/api/pools'
import useSWR from 'swr'
import { PoolType } from 'types'
import { SortDirection } from 'views/Dashboard/types'

function buildSearchParams({
  poolTypes,
  skip,
  addresses,
  tokenAddress,
  boostedOnly,
  searchKey,
  sortBy,
  sortDirection,
}: Pick<
  UsePoolsParams,
  'poolTypes' | 'skip' | 'addresses' | 'tokenAddress' | 'boostedOnly' | 'searchKey' | 'sortBy' | 'sortDirection'
>) {
  const params = new URLSearchParams()
  if (poolTypes) {
    params.set('types', poolTypes.join(','))
  }

  if (sortBy) {
    params.set('sortBy', sortBy)
  }

  if (sortDirection) {
    params.set('sortDirection', sortDirection)
  }

  if (boostedOnly) {
    params.set('boostedOnly', 'true')
  }

  if (searchKey) {
    params.set('searchKey', searchKey)
  }

  if (skip) {
    params.set('skip', skip.toString())
  }

  if (addresses && addresses.length) {
    params.set('onlyPoolIds', addresses.join(','))
  }

  if (tokenAddress) {
    params.set('tokenAddress', tokenAddress)
  }

  return params.toString()
}

export const POOLS_SORT_BY_LIST = ['apy24H', 'apy7D', 'volume24H', 'volume7D', 'tvl'] as const
export type PoolsSortBy = (typeof POOLS_SORT_BY_LIST)[number]

type UsePoolsParams = {
  poolTypes?: PoolType[]
  skip?: number
  addresses?: string[]
  tokenAddress?: string
  boostedOnly?: boolean
  searchKey?: string
  sortBy?: PoolsSortBy
  sortDirection?: SortDirection
}
type UsePoolsOptions = {
  paused?: boolean
}
export default function usePools(
  { poolTypes = ['v3'], skip, addresses, tokenAddress, boostedOnly, searchKey, sortBy, sortDirection }: UsePoolsParams,
  { paused = false }: UsePoolsOptions = {},
) {
  const params = buildSearchParams({
    poolTypes,
    skip,
    addresses,
    tokenAddress,
    boostedOnly,
    searchKey,
    sortBy,
    sortDirection,
  })

  const { data, error } = useSWR(paused || !poolTypes ? null : ['dashboard/pools', params], async () => {
    const res = await fetch(`/api/pools?${params}`)
    const parsed = (await res.json()) as { pools: PoolParsed[]; totalPage: number }

    return parsed
  })

  return {
    poolsData: data?.pools,
    totalPage: data?.totalPage,
    poolsDataloading: !data && !error,
  }
}
