import { useTranslation } from '@pancakeswap/localization'
import { Spinner, useMatchBreakpoints } from '@pancakeswap/uikit'
import clsx from 'clsx'

import { DashboardPoolType } from 'pages/dashboard'
import { useCallback, useEffect, useMemo, useState } from 'react'
import Pagination from 'views/Dashboard/components/Pagination'
import { PoolDataRow, PoolDataRowSkeleton } from 'views/Dashboard/components/PoolTable/PoolDataRow'
import SortHeaderButton from 'views/Dashboard/components/SortHeaderButton'
import usePools, { PoolsSortBy } from 'views/Dashboard/hooks/usePools'
import { SortDirection } from 'views/Dashboard/types'

const HEADER_IDS = ['pair', 'tvl', 'apy24H', 'apy7D', 'volume24H', 'volume7D'] as const
type HeaderId = (typeof HEADER_IDS)[number]

const TITLES = ['Pair', 'TVL', 'Apy 24H', 'Apy 7D', 'Volume 24H', 'Volume 7D'] as const
type Title = (typeof TITLES)[number]

const HEADERS: {
  id: HeaderId
  title: Title
  sortBy?: PoolsSortBy
}[] = [
  { id: 'pair', title: 'Pair' },
  { id: 'tvl', title: 'TVL', sortBy: 'tvl' },
  { id: 'volume24H', title: 'Volume 24H', sortBy: 'volume24H' },
  { id: 'volume7D', title: 'Volume 7D', sortBy: 'volume7D' },
  { id: 'apy24H', title: 'Apy 24H', sortBy: 'apy24H' },
  { id: 'apy7D', title: 'Apy 7D', sortBy: 'apy7D' },
]

const bSmeaders: Partial<HeaderId>[] = ['pair', 'tvl', 'volume24H']
const smHeaders: Partial<HeaderId>[] = [...bSmeaders, 'apy24H']
const mdHeaders: Partial<HeaderId>[] = [...smHeaders, 'apy7D', 'volume7D']

const SHOW_POOL_COUNT = 10

export default function PoolTable({ poolType, searchInput }: { poolType: DashboardPoolType; searchInput?: string }) {
  const { t } = useTranslation()

  // for sorting
  const [sortBy, setSortBy] = useState<PoolsSortBy>('tvl')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  // pagination
  const [page, setPage] = useState(1)
  const skip = (page - 1) * SHOW_POOL_COUNT
  const [_totalPage, setTotalPage] = useState(1)

  const [isFirstRender, setIsFirstRender] = useState(true)

  const { poolsData, totalPage } = usePools({
    poolTypes: [poolType],
    skip,
    searchKey: searchInput,
    sortBy,
    sortDirection,
  })

  useEffect(() => {
    if (poolsData && poolsData.length > 0) {
      setIsFirstRender(false)
    }
  }, [poolsData])

  useEffect(() => {
    if (totalPage === undefined) return

    setTotalPage(totalPage)
  }, [totalPage])

  useEffect(() => {
    setPage(1)
  }, [searchInput, poolType])

  const handleSort = useCallback(
    (newField: PoolsSortBy) => {
      setSortBy(newField)
      setSortDirection(sortBy !== newField ? 'desc' : sortDirection === 'desc' ? 'asc' : 'desc')
      setPage(1)
    },
    [sortDirection, sortBy],
  )

  const { isBelowSm, isSm, isMd, isMobile } = useMatchBreakpoints()
  const headers = useMemo(
    () =>
      HEADERS.filter(({ id }) =>
        isBelowSm ? bSmeaders.includes(id) : isSm ? smHeaders.includes(id) : isMd ? mdHeaders.includes(id) : true,
      ),
    [isSm, isBelowSm, isMd],
  )

  return (
    <>
      <table className="w-full rounded-xl overflow-hidden">
        <colgroup>
          <col width="*" />
          <col width="110px" />
          <col width="110px" />
          {!isMobile && <col width="110px" />}
          {!isBelowSm && <col width="100px" />}
          {!isMobile && <col width="100px" />}
        </colgroup>
        <thead>
          <tr className="text-on-surface-subtle bg-neutral text-xs">
            {headers.map(({ title, sortBy: s }, index) => (
              <th
                key={`poolTable:${s}`}
                className={clsx('py-3 text-left', {
                  'px-4 s:px-6': index === 0,
                  'px-4': index !== 0,
                })}
              >
                {s ? (
                  <SortHeaderButton
                    title={title}
                    onClick={() => handleSort(s as PoolsSortBy)}
                    isSelected={sortBy === s}
                    sortDirection={sortDirection}
                  />
                ) : (
                  <>{title}</>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isFirstRender ? (
            <tr>
              <td colSpan={headers.length} className="h-[250px] md:h-[300px] text-center">
                <div className="flex items-center justify-center w-full">
                  <Spinner />
                </div>
              </td>
            </tr>
          ) : !poolsData ? (
            Array.from({ length: SHOW_POOL_COUNT }).map((_, index) => (
              <PoolDataRowSkeleton key={`poolTableSkeleton:${index + 1}`} isLastIndex={index === SHOW_POOL_COUNT - 1} />
            ))
          ) : poolsData.length > 0 ? (
            poolsData.map((poolData, index) => (
              <PoolDataRow
                key={`poolTable:${poolData.id}`}
                poolData={poolData}
                isLastIndex={index === poolsData.length - 1}
              />
            ))
          ) : (
            <tr>
              <td colSpan={headers.length} className="h-[250px] md:h-[300px] text-center">
                <div className="flex items-center justify-center w-full">
                  <p className="text-on-surface">{t('No Pairs')}</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <Pagination page={page} setPage={setPage} totalPage={_totalPage} />
    </>
  )
}
