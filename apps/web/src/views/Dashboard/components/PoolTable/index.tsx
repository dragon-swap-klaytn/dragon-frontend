import { useDebounce } from '@pancakeswap/hooks'
import { useTranslation } from '@pancakeswap/localization'
import { ButtonV2, Notification, Spinner } from '@pancakeswap/uikit'
import clsx from 'clsx'
import { DEFAULT_POOLS_FILTERS } from 'const'
import { Portfolio, PortfolioV3DataBigInt } from 'hooks/usePortfolio'
import { usePathname } from 'next/navigation'
import { useRouter } from 'next/router'
import { PortfolioWithDepositedTvlMap } from 'pages/pools'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { KeyedMutator } from 'swr'
import { PoolType } from 'types'
import useDeepCompareEffect from 'use-deep-compare-effect'
import isEmptyObject from 'utils/isEmptyObject'
import { Address } from 'viem'
import Pagination from 'views/Dashboard/components/Pagination'
import { PoolDataRow, PoolDataRowSkeleton } from 'views/Dashboard/components/PoolTable/PoolDataRow'
import SortHeaderButton from 'views/Dashboard/components/SortHeaderButton'
import usePools, { buildUsePoolsSearchParams, PoolsSortBy } from 'views/Dashboard/hooks/usePools'
import { SortDirection } from 'views/Dashboard/types'
import { useAccount } from 'wagmi'

const HEADER_IDS = ['pool', 'myDeposits', 'tvl', 'apy24H', 'apy7D', 'volume24H', 'volume7D'] as const
type HeaderId = (typeof HEADER_IDS)[number]

const TITLES = ['Pool', 'My Deposits', 'TVL', 'Apy 24H', 'Apy 7D', 'Volume 24H', 'Volume 7D'] as const
type Title = (typeof TITLES)[number]

type PoolTableHeader = {
  id: HeaderId
  title: Title
  sortBy?: PoolsSortBy
  hideBelow?: 's' | 'sm' | 'md' | 'lg'
  displayClassName?: string
  isCentered?: boolean
  onlyMyPosition?: boolean
}

const HEADERS: PoolTableHeader[] = [
  { id: 'pool', title: 'Pool' },
  { id: 'myDeposits', title: 'My Deposits', sortBy: 'poolIds', onlyMyPosition: true },
  { id: 'apy24H', title: 'Apy 24H', sortBy: 'apy24H', isCentered: true },
  { id: 'apy7D', title: 'Apy 7D', sortBy: 'apy7D', displayClassName: 'hidden lg:table-cell', isCentered: true },
  { id: 'tvl', title: 'TVL', sortBy: 'tvl', displayClassName: 'hidden sm:table-cell' },
  { id: 'volume24H', title: 'Volume 24H', sortBy: 'volume24H', displayClassName: 'hidden s:table-cell' },
  { id: 'volume7D', title: 'Volume 7D', sortBy: 'volume7D', displayClassName: 'hidden lg:table-cell' },
]

const SHOW_POOL_COUNT = 10

type PoolsAdditionalParams = {
  sortBy: PoolsSortBy
  sortDirection: SortDirection
  page: number
}
export default function PoolTable({
  baseParams,
  openable = false,
  portfolio,
  mutatePortfolio,
  initialSortBy = DEFAULT_POOLS_FILTERS.sortBy,
  resetPoolTypeOptions,
  resetBaseParams,
}: {
  baseParams: {
    poolTypes: PoolType[]
    searchKey?: string
    boostedOnly?: boolean
    myPositionOnly?: boolean
    tokenAddress?: string
    addresses?: Address[]
  }
  openable?: boolean
  portfolio?: PortfolioWithDepositedTvlMap
  mutatePortfolio?: KeyedMutator<Portfolio>
  initialSortBy?: PoolsSortBy
  resetPoolTypeOptions?: () => void
  resetBaseParams?: () => void
}) {
  const {
    t,
    i18n: { language: locale },
  } = useTranslation()
  const { address: account } = useAccount()

  // for sorting
  const [sortBy, setSortBy] = useState<PoolsSortBy>(initialSortBy)
  const [sortDirection, setSortDirection] = useState<SortDirection>(DEFAULT_POOLS_FILTERS.sortDirection)

  // pagination
  const [page, setPage] = useState(DEFAULT_POOLS_FILTERS.page)
  const [totalPage, setTotalPage] = useState(0)

  const isFirstRenderRef = useRef(true)
  const [isRouterReady, setRouterReady] = useState(true)
  // To use useDeepCompareEffect, initialize with {} instead of null.
  const [additionalParams, setAdditionalParams] = useState<PoolsAdditionalParams>({} as PoolsAdditionalParams)

  const init = useCallback(() => {
    setRouterReady(false)
    isFirstRenderRef.current = true
    setAdditionalParams({} as PoolsAdditionalParams)
    setSortBy(DEFAULT_POOLS_FILTERS.sortBy)
    setSortDirection(DEFAULT_POOLS_FILTERS.sortDirection)
    setPage(DEFAULT_POOLS_FILTERS.page)
    resetBaseParams?.()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [resetBaseParams])

  const router = useRouter()
  const pathname = usePathname()
  useEffect(() => {
    const handleRouteChange = (url: string) => {
      if (url === `${locale === 'ko' ? '/ko' : ''}${pathname}`) {
        init()
      }
    }

    const handleRouteChangeComplete = () => setRouterReady(true)

    router.events.on('routeChangeStart', handleRouteChange)
    router.events.on('routeChangeComplete', handleRouteChangeComplete)

    return () => {
      router.events.off('routeChangeStart', handleRouteChange)
      router.events.off('routeChangeComplete', handleRouteChangeComplete)
    }
  }, [router.events, pathname, locale, init])

  useEffect(() => {
    // Set using the query string value on the first render
    if (!router.isReady || !isRouterReady) return
    if (!isEmptyObject(additionalParams)) return

    const { poolsPage: _page, poolsSortBy: _sortBy, poolsSortDirection: _sortDirection } = router.query

    const newPage = Number(_page) || DEFAULT_POOLS_FILTERS.page
    setPage(newPage)

    const newSortBy = (_sortBy as PoolsSortBy) || DEFAULT_POOLS_FILTERS.sortBy
    setSortBy(newSortBy)

    const newSortDirection = (_sortDirection as SortDirection) || DEFAULT_POOLS_FILTERS.sortDirection
    setSortDirection(newSortDirection)

    setAdditionalParams({
      sortBy: newSortBy,
      sortDirection: newSortDirection,
      page: newPage,
    })
  }, [router.isReady, router.query, additionalParams, isRouterReady])

  useDeepCompareEffect(() => {
    if (isEmptyObject(additionalParams)) return

    setAdditionalParams({
      page,
      sortBy,
      sortDirection,
    })
  }, [page, sortBy, sortDirection, additionalParams])

  const [newRouterUrl, setNewRouterUrl] = useState('')
  const debouncedNewRouterUrl = useDebounce(newRouterUrl, 500)

  useDeepCompareEffect(() => {
    if (!router.isReady || isFirstRenderRef.current || !isRouterReady) return
    if (isEmptyObject(baseParams) || isEmptyObject(additionalParams)) return

    const { poolTypes, myPositionOnly, boostedOnly, searchKey } = baseParams
    const { page: _page, sortBy: _sortBy, sortDirection: _sortDirection } = additionalParams

    const urlSearchParams = new URLSearchParams({
      ...router.query,
      poolsTypes: poolTypes.join(','),
      poolsPage: _page.toString(),
      poolsSortBy: _sortBy,
      poolsSortDirection: _sortDirection,
    })

    urlSearchParams.set('myPositionOnly', myPositionOnly ? myPositionOnly.toString() : 'false')
    urlSearchParams.set('boostedOnly', boostedOnly ? boostedOnly.toString() : 'false')
    urlSearchParams.set('poolsSearchKey', searchKey || '')

    setNewRouterUrl(
      JSON.stringify({
        pathName: router.pathname,
        query: urlSearchParams.toString(),
      }),
    )
  }, [baseParams, additionalParams, router.isReady, locale, isRouterReady])

  useEffect(() => {
    if (!debouncedNewRouterUrl) return

    const { pathName: _pathName, query: _query } = JSON.parse(debouncedNewRouterUrl)

    router.replace(
      {
        pathname: _pathName,
        query: _query,
      },
      undefined,
      { shallow: true, locale },
    )
  }, [debouncedNewRouterUrl, locale])

  const query = useMemo(() => {
    if (isEmptyObject(baseParams) || isEmptyObject(additionalParams)) return ''

    return buildUsePoolsSearchParams({
      ...baseParams,
      ...additionalParams,
      skip: (additionalParams.page - 1) * SHOW_POOL_COUNT,
    })
  }, [baseParams, additionalParams])

  const debouncedQuery = useDebounce(query.toString(), 500)

  const debouncedMyPositionOnly = useMemo(() => {
    if (!debouncedNewRouterUrl) return false

    const { query: _query } = JSON.parse(debouncedNewRouterUrl)
    if (!_query) return false

    const newSearchParams = new URLSearchParams(_query)
    return newSearchParams.get('myPositionOnly') === 'true'
  }, [debouncedNewRouterUrl])

  const { poolsData, totalPage: fetchedTotalPage, totalCount } = usePools(debouncedQuery, { paused: !debouncedQuery })
  useEffect(() => {
    if (!poolsData) return

    isFirstRenderRef.current = false
  }, [poolsData])

  useEffect(() => {
    if (fetchedTotalPage === undefined) return

    setTotalPage(fetchedTotalPage || 0)
  }, [fetchedTotalPage])

  const paramsString = [
    baseParams?.poolTypes?.join('-') ?? '',
    baseParams?.tokenAddress,
    baseParams?.addresses?.join('-') ?? '',
    baseParams?.boostedOnly ? 'boosted' : '',
    baseParams?.searchKey,
    sortBy,
    sortDirection,
  ].join(';')

  useEffect(() => {
    if (isFirstRenderRef.current) return

    setPage(1)
  }, [baseParams?.searchKey, paramsString])

  useEffect(() => {
    if (totalPage === 0) return
    if (!poolsData) return

    if (page > totalPage) {
      setPage(1)
    }
  }, [page, totalPage, poolsData])

  const handleSort = useCallback(
    (newField: PoolsSortBy) => {
      setSortBy(newField)
      setSortDirection(sortBy !== newField ? 'desc' : sortDirection === 'desc' ? 'asc' : 'desc')
    },
    [sortDirection, sortBy],
  )

  const hasMissingPools = useMemo(() => {
    if (!baseParams?.addresses || !totalCount) {
      return false
    }

    let poolCount = 0

    if (portfolio) {
      Object.values(portfolio).forEach((pool) => {
        if (pool.type === 'v2') {
          poolCount += 1
        } else {
          const v3Pool = pool as PortfolioV3DataBigInt
          poolCount += v3Pool.positions.length
        }
      })
    }

    return poolCount !== totalCount
  }, [portfolio, baseParams.addresses, totalCount])

  return (
    <div className="w-full">
      <Notification variant="info" nStyle="default" className={clsx('-mt-1 mb-4 hidden', { block: hasMissingPools })}>
        <p className="break-keep">
          {t(
            'When a new pool that didn’t previously exist on DragonSwap is created, it may take approximately 10 minutes for it to appear on the list.',
          )}
        </p>
      </Notification>

      {baseParams?.poolTypes?.length === 0 ? (
        <div className="flex flex-col space-y-3 items-center justify-center w-full h-[250px] md:h-[300px]">
          <p className="text-on-surface">{t('Please select at least one pool type.')}</p>

          {resetPoolTypeOptions && (
            <ButtonV2 className="mt-4" variant="secondary" onClick={resetPoolTypeOptions}>
              {t('Select All')}
            </ButtonV2>
          )}
        </div>
      ) : (
        <>
          <table className="w-full rounded-xl overflow-hidden">
            <colgroup>
              {/* Pool */}
              <col width="*" />
              <col width="88px" className="xs:hidden" />
              {/* My Deposits */}
              {account && debouncedMyPositionOnly && <col width="80px" className="hidden xs:table-column" />}
              {/* apy24H */}
              <col width="100px" className="hidden xs:table-column" />
              {/* apy7D */}
              <col width="100px" className="hidden lg:table-column" />
              {/* TVL */}
              <col width="80px" className="hidden sm:table-column" />
              {/* volume24H */}
              <col width="80px" className="hidden s:table-column" />
              {/* volume7D */}
              <col width="80px" className="hidden lg:table-column" />
              {/* open details */}
              {openable && <col width="30px" />}
            </colgroup>
            <thead>
              <tr
                className={clsx('text-on-surface-subtle bg-neutral text-xs', {
                  hidden: poolsData?.length === 0,
                })}
              >
                {HEADERS.map(({ title, sortBy: s, displayClassName, isCentered, onlyMyPosition }, index) => (
                  <th
                    key={`poolTable:${s}`}
                    className={clsx('py-3 text-left', displayClassName, {
                      'px-4 s:px-6': index === 0,
                      'px-4': index !== 0,
                      hidden: onlyMyPosition && (!debouncedMyPositionOnly || !account),
                    })}
                  >
                    <div className={clsx({ 'flex justify-center': !!isCentered })}>
                      {s ? (
                        <SortHeaderButton
                          title={title}
                          onClick={() => handleSort(s as PoolsSortBy)}
                          isSelected={sortBy === s}
                          sortDirection={sortDirection}
                        />
                      ) : (
                        <span className="font-medium">{title}</span>
                      )}
                    </div>
                  </th>
                ))}

                {openable && (
                  <th className="relative">
                    <span className="sr-only">open details</span>
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {!isFirstRenderRef.current &&
                (!poolsData ? (
                  Array.from({ length: SHOW_POOL_COUNT }).map((_, index) => (
                    <PoolDataRowSkeleton
                      key={`poolTableSkeleton:${index + 1}`}
                      isLastIndex={index === SHOW_POOL_COUNT - 1}
                      openable={openable}
                      myPositionOnly={account && debouncedMyPositionOnly}
                    />
                  ))
                ) : poolsData.length > 0 ? (
                  poolsData.map((poolData, index) => (
                    <PoolDataRow
                      key={`poolTable:${poolData.id}`}
                      portfolioData={portfolio?.[poolData.id]}
                      mutatePortfolio={mutatePortfolio}
                      poolData={poolData}
                      isLastIndex={index === poolsData.length - 1}
                      openable={openable}
                      myPositionOnly={account && debouncedMyPositionOnly}
                    />
                  ))
                ) : (
                  <tr>
                    <td colSpan={HEADERS.length} className="h-[250px] md:h-[300px] text-center">
                      <div className="flex items-center justify-center w-full">
                        <p className="text-on-surface">{t('No Pools')}</p>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>

          {isFirstRenderRef.current && (
            <div className="flex items-center justify-center w-full h-[250px] md:h-[300px]">
              <Spinner />
            </div>
          )}

          {baseParams?.poolTypes?.length !== 0 && (
            <div className="mt-5">
              <Pagination page={page} setPage={setPage} totalPage={totalPage} />
            </div>
          )}
        </>
      )}
    </div>
  )
}
