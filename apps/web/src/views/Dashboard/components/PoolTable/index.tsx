import { useTranslation } from '@pancakeswap/localization'
import { Spinner, useMatchBreakpoints } from '@pancakeswap/uikit'
import clsx from 'clsx'
import { Portfolio } from 'hooks/use-portfolio'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { PoolType } from 'types'
import { Address } from 'viem'
import Pagination from 'views/Dashboard/components/Pagination'
import { PoolDataRow, PoolDataRowSkeleton } from 'views/Dashboard/components/PoolTable/PoolDataRow'
import SortHeaderButton from 'views/Dashboard/components/SortHeaderButton'
import usePools, { PoolsSortBy } from 'views/Dashboard/hooks/usePools'
import { SortDirection } from 'views/Dashboard/types'

const HEADER_IDS = ['pool', 'tvl', 'apy24H', 'apy7D', 'volume24H', 'volume7D'] as const
type HeaderId = (typeof HEADER_IDS)[number]

const TITLES = ['Pool', 'TVL', 'Apy 24H', 'Apy 7D', 'Volume 24H', 'Volume 7D'] as const
type Title = (typeof TITLES)[number]

const HEADERS: {
  id: HeaderId
  title: Title
  sortBy?: PoolsSortBy
}[] = [
  { id: 'pool', title: 'Pool' },
  { id: 'apy24H', title: 'Apy 24H', sortBy: 'apy24H' },
  { id: 'apy7D', title: 'Apy 7D', sortBy: 'apy7D' },
  { id: 'tvl', title: 'TVL', sortBy: 'tvl' },
  { id: 'volume24H', title: 'Volume 24H', sortBy: 'volume24H' },
  { id: 'volume7D', title: 'Volume 7D', sortBy: 'volume7D' },
]

const bSmeaders: Partial<HeaderId>[] = ['pool', 'tvl', 'volume24H']
const smHeaders: Partial<HeaderId>[] = [...bSmeaders, 'apy24H']
const mdHeaders: Partial<HeaderId>[] = [...smHeaders, 'apy7D', 'volume7D']

const SHOW_POOL_COUNT = 10

export default function PoolTable({
  poolTypes,
  searchKey,
  tokenAddress,
  addresses,
  boostedOnly,
  portfolio,
  initialSortBy = 'tvl',
  hide7DColumn = false,
}: {
  poolTypes?: PoolType[]
  searchKey?: string
  tokenAddress?: string
  addresses?: Address[]
  boostedOnly?: boolean
  portfolio?: Portfolio
  initialSortBy?: PoolsSortBy
  hide7DColumn?: boolean
}) {
  const { t } = useTranslation()

  // for sorting
  const [sortBy, setSortBy] = useState<PoolsSortBy>(initialSortBy)
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  // pagination
  const [page, setPage] = useState(1)
  const skip = (page - 1) * SHOW_POOL_COUNT
  const [_totalPage, setTotalPage] = useState(-1)

  const [isFirstRender, setIsFirstRender] = useState(true)

  const { poolsData, totalPage } = usePools({
    poolTypes,
    skip,
    tokenAddress,
    boostedOnly,
    searchKey,
    sortBy,
    sortDirection,
    addresses,
  })

  useEffect(() => {
    if (poolsData && poolsData.length > 0) {
      setIsFirstRender(false)
    }
  }, [poolsData])

  useEffect(() => {
    setTotalPage(totalPage ?? -1)
  }, [totalPage])

  const paramsString = [
    poolTypes?.join('-') ?? '',
    tokenAddress,
    boostedOnly ? 'boosted' : '',
    searchKey,
    sortBy,
    sortDirection,
    addresses?.join('-') ?? '',
  ].join(';')

  useEffect(() => {
    setPage(1)
  }, [searchKey, paramsString])

  const handleSort = useCallback(
    (newField: PoolsSortBy) => {
      setSortBy(newField)
      setSortDirection(sortBy !== newField ? 'desc' : sortDirection === 'desc' ? 'asc' : 'desc')
    },
    [sortDirection, sortBy],
  )

  const { isBelowSm, isSm, isMd, isMobile } = useMatchBreakpoints()
  const headers = useMemo(
    () =>
      HEADERS.filter(({ id }) =>
        isBelowSm ? bSmeaders.includes(id) : isSm ? smHeaders.includes(id) : isMd ? mdHeaders.includes(id) : true,
      ).filter(({ id }) => (hide7DColumn ? id !== 'volume7D' && id !== 'apy7D' : true)),
    [isSm, isBelowSm, isMd, hide7DColumn],
  )

  return (
    <div className="w-full">
      <table className="w-full rounded-xl overflow-hidden">
        <colgroup>
          {/* Pool */}
          <col width="*" />
          {/* apy24H */}
          {!isBelowSm && <col width="150px" />}
          {/* apy7D */}
          {!hide7DColumn && !isMobile && <col width="80px" />}
          {/* TVL */}
          <col width="110px" />
          {/* volume24H */}
          <col width="110px" />
          {/* volume7D */}
          {!hide7DColumn && <col width="110px" />}
          {/* open details */}
          {!isMobile && <col width="30px" />}
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
            <th className="py-3 px-2 sr-only">open details</th>
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
              <PoolDataRowSkeleton
                key={`poolTableSkeleton:${index + 1}`}
                isLastIndex={index === SHOW_POOL_COUNT - 1}
                hide7DColumn={hide7DColumn}
              />
            ))
          ) : poolsData.length > 0 ? (
            poolsData.map((poolData, index) => (
              <PoolDataRow
                key={`poolTable:${poolData.id}`}
                userData={portfolio?.[poolData.id]}
                poolData={poolData}
                isLastIndex={index === poolsData.length - 1}
                hide7DColumn={hide7DColumn}
              />
            ))
          ) : (
            <tr>
              <td colSpan={headers.length} className="h-[250px] md:h-[300px] text-center">
                <div className="flex items-center justify-center w-full">
                  <p className="text-on-surface">{t('No Pools')}</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {_totalPage > 1 && (
        <div className="mt-5">
          <Pagination page={page} setPage={setPage} totalPage={_totalPage} />
        </div>
      )}
    </div>
  )
}
