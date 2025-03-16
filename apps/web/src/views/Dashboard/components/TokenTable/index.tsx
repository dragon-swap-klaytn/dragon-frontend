import { useTranslation } from '@pancakeswap/localization'
import { Spinner } from '@pancakeswap/uikit'
import clsx from 'clsx'
import { usePathname } from 'next/navigation'
import { useRouter } from 'next/router'
import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { PoolType } from 'types'
import useDeepCompareEffect from 'use-deep-compare-effect'
import isEmptyObject from 'utils/isEmptyObject'
import Pagination from 'views/Dashboard/components/Pagination'
import SortHeaderButton from 'views/Dashboard/components/SortHeaderButton'
import { TokenDataRow, TokenDataRowSkeleton } from 'views/Dashboard/components/TokenTable/TokenDataRow'
import useTokensData, { buildUseTokensSearchParams, TokensSortBy } from 'views/Dashboard/hooks/useTokensData'
import { DEFAULT_TOKENS_FILTERS } from 'views/Dashboard/Tokens'
import { SortDirection } from 'views/Dashboard/types'

const HEADER_IDS = ['name', 'price', 'priceChange24H', 'priceChange7D', 'volume24H', 'volume7D', 'tvl'] as const
type HeaderId = (typeof HEADER_IDS)[number]

const TITLES = ['Name', 'Price', 'Price Change', 'Price Change 7D', 'Volume 24H', 'Volume 7D', 'TVL'] as const
type Title = (typeof TITLES)[number]

type TokenTableHeader = {
  id: HeaderId
  title: Title | ReactNode
  sortBy?: TokensSortBy
  displayClassName?: string
}
const HEADERS: TokenTableHeader[] = [
  { id: 'name', title: 'Name' },
  { id: 'price', title: 'Price' },
  { id: 'priceChange24H', title: 'Price Change', sortBy: 'priceChange24H' },
  {
    id: 'priceChange7D',
    title: (
      <span>
        Price <span className="inline-block whitespace-nowrap">Change 7D</span>
      </span>
    ),
    sortBy: 'priceChange7D',
    displayClassName: 'hidden md:table-cell',
  },
  { id: 'volume24H', title: 'Volume 24H', sortBy: 'volume24H', displayClassName: 'hidden s:table-cell' },
  { id: 'volume7D', title: 'Volume 7D', sortBy: 'volume7D', displayClassName: 'hidden md:table-cell' },
  { id: 'tvl', title: 'TVL', sortBy: 'tvl', displayClassName: 'hidden sm:table-cell' },
]

const SHOW_TOKENS_COUNT = 10

type TokensAdditionalParams = {
  sortBy: TokensSortBy
  sortDirection: SortDirection
  page: number
}
export default function TokenTable({
  baseParams,
  resetBaseParams,
}: {
  maxItems?: number
  baseParams: {
    poolType: PoolType
    searchKey: string
    addresses?: string[]
  }
  resetBaseParams?: () => void
}) {
  const {
    t,
    i18n: { language: locale },
  } = useTranslation()

  // for sorting
  const [sortBy, setSortBy] = useState<TokensSortBy>(DEFAULT_TOKENS_FILTERS.sortBy)
  const [sortDirection, setSortDirection] = useState<SortDirection>(DEFAULT_TOKENS_FILTERS.sortDirection)

  // pagination
  const [page, setPage] = useState(1)
  const [totalPage, setTotalPage] = useState(0)

  const isFirstRenderRef = useRef(true)
  const [isRouterReady, setRouterReady] = useState(true)
  // To use useDeepCompareEffect, initialize with {} instead of null.
  const [additionalParams, setAdditionalParams] = useState<TokensAdditionalParams>({} as TokensAdditionalParams)

  const init = useCallback(() => {
    setRouterReady(false)
    isFirstRenderRef.current = true
    setAdditionalParams({} as TokensAdditionalParams)
    setSortBy(DEFAULT_TOKENS_FILTERS.sortBy)
    setSortDirection(DEFAULT_TOKENS_FILTERS.sortDirection)
    setPage(DEFAULT_TOKENS_FILTERS.page)
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
    if (!router.isReady || !isRouterReady) return
    if (!isEmptyObject(additionalParams)) return

    const { tokensPage: _page, tokensSortBy: _sortBy, tokensSortDirection: _sortDirection } = router.query

    const newPage = Number(_page) || DEFAULT_TOKENS_FILTERS.page
    setPage(newPage)

    const newSortBy = (_sortBy as TokensSortBy) || DEFAULT_TOKENS_FILTERS.sortBy
    setSortBy(newSortBy)

    const newSortDirection = (_sortDirection as SortDirection) || DEFAULT_TOKENS_FILTERS.sortDirection
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

  useDeepCompareEffect(() => {
    if (!router.isReady || isFirstRenderRef.current || !isRouterReady) return
    if (isEmptyObject(baseParams) || isEmptyObject(additionalParams)) return

    const { poolType, searchKey } = baseParams
    const { page: _page, sortBy: _sortBy, sortDirection: _sortDirection } = additionalParams

    const urlSearchParams = new URLSearchParams({
      ...router.query,
      tokensTypes: poolType,
      tokensPage: _page.toString(),
      tokensSortBy: _sortBy,
      tokensSortDirection: _sortDirection,
    })

    urlSearchParams.set('tokensSearchKey', searchKey)

    router.replace(
      {
        pathname: router.pathname,
        query: urlSearchParams.toString(),
      },
      undefined,
      { shallow: true, locale },
    )
  }, [baseParams, additionalParams, router.isReady, locale, isRouterReady])

  const query = useMemo(() => {
    if (isEmptyObject(baseParams) || isEmptyObject(additionalParams)) return ''

    return buildUseTokensSearchParams({
      ...baseParams,
      ...additionalParams,
      skip: (additionalParams.page - 1) * SHOW_TOKENS_COUNT,
    })
  }, [baseParams, additionalParams])

  const { tokensData, totalPage: fetchedTotalPage } = useTokensData({
    poolType: baseParams?.poolType,
    query,
  })
  useEffect(() => {
    if (!tokensData) return

    isFirstRenderRef.current = false
  }, [tokensData])

  useEffect(() => {
    if (fetchedTotalPage === undefined) return

    setTotalPage(fetchedTotalPage || 0)
  }, [fetchedTotalPage])

  const paramsString = [
    baseParams?.poolType ?? '',
    baseParams?.searchKey,
    baseParams?.addresses?.join('-') ?? '',
    sortBy,
    sortDirection,
  ].join(';')

  useEffect(() => {
    if (isFirstRenderRef.current) return

    setPage(1)
  }, [baseParams?.searchKey, paramsString])

  const handleSort = useCallback(
    (newField: TokensSortBy) => {
      setSortBy(newField)
      setSortDirection(sortBy !== newField ? 'desc' : sortDirection === 'desc' ? 'asc' : 'desc')
      setPage(1)
    },
    [sortDirection, sortBy],
  )

  return (
    <>
      <table className="w-full rounded-xl overflow-hidden">
        <colgroup>
          <col width="50%" />
          <col width="*" />
          <col width="*" />
          <col width="*" />
          <col width="*" />
          <col width="*" />
          <col width="*" />
        </colgroup>
        <thead>
          <tr
            className={clsx('text-on-surface-subtle bg-neutral text-xs', {
              hidden: tokensData?.length === 0,
            })}
          >
            {HEADERS.map(({ title, sortBy: s, displayClassName }, index) => (
              <th
                key={`tokenTable:${title}`}
                className={clsx('py-3 text-left', displayClassName, {
                  'px-4 s:px-6': index === 0,
                  'px-4': index !== 0,
                })}
              >
                {s ? (
                  <SortHeaderButton
                    title={title}
                    onClick={() => handleSort(s as TokensSortBy)}
                    isSelected={sortBy === s}
                    sortDirection={sortDirection}
                  />
                ) : (
                  <span className="font-medium">{title}</span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {!isFirstRenderRef.current &&
            (!tokensData ? (
              Array.from({ length: SHOW_TOKENS_COUNT }).map((_, index) => (
                <TokenDataRowSkeleton
                  key={`tokenTable:skeleton:${index + 1}`}
                  isLastIndex={index === SHOW_TOKENS_COUNT - 1}
                />
              ))
            ) : tokensData.length > 0 ? (
              tokensData.map((tokenData, index) => (
                <TokenDataRow
                  key={`tokenTable:${tokenData.id}`}
                  tokenData={tokenData}
                  isLastIndex={index === tokensData.length - 1}
                />
              ))
            ) : (
              <tr>
                <td colSpan={HEADERS.length} className="h-[250px] md:h-[300px] text-center">
                  <div className="flex items-center justify-center w-full">
                    <p className="text-on-surface">{t('No Tokens')}</p>
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

      <Pagination page={page} setPage={setPage} totalPage={totalPage} />
    </>
  )
}
