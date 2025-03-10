import { useDebounce } from '@pancakeswap/hooks'
import { PoolParsed } from 'pages/api/pools'
import useSWR from 'swr'
import { PoolType } from 'types'
import { SortDirection } from 'views/Dashboard/types'
import { wkaiaToKaia } from 'views/Dashboard/utils/wkaiaToKaia'

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

  const debouncedParams = useDebounce(params, 500)

  const { data, error } = useSWR(
    paused || !poolTypes || poolTypes.length === 0 || !debouncedParams ? null : ['dashboard/pools', debouncedParams],
    async () => {
      const res = await fetch(`/api/pools?${debouncedParams}`)
      const parsed = (await res.json()) as { pools: PoolParsed[]; totalPage: number; totalCount: number }

      return parsed
    },
    {
      revalidateOnFocus: false,
    },
  )

  return {
    poolsData: data?.pools
      ? data.pools.map((p) => ({
          ...p,
          token0: wkaiaToKaia(p.token0),
          token1: wkaiaToKaia(p.token1),
        }))
      : undefined,
    totalPage: data?.totalPage,
    totalCount: data?.totalCount,
    poolsDataloading: !data && !error,
  }
}
