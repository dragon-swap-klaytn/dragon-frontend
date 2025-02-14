import { useTranslation } from '@pancakeswap/localization'
import { CurrencyLogoWithSymbol, Spinner, TagV2, useMatchBreakpoints } from '@pancakeswap/uikit'
import clsx from 'clsx'

import { PoolParsed } from 'pages/api/pools'
import { DashboardPoolType } from 'pages/dashboard'
import { useCallback, useEffect, useMemo, useState } from 'react'
import getPercentage from 'utils/getPercentage'
import Pagination from 'views/Dashboard/components/Pagination'
import SortHeaderButton from 'views/Dashboard/components/SortHeaderButton'
import usePools, { PoolsSortBy } from 'views/Dashboard/hooks/usePools'
import { SortDirection } from 'views/Dashboard/types'
import { feeTierPercent } from 'views/Dashboard/utils'
import { formatDollarAmount } from '../../utils/numbers'

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
  { id: 'apy24H', title: 'Apy 24H', sortBy: 'apy24H' },
  { id: 'volume7D', title: 'Volume 7D', sortBy: 'volume7D' },
  { id: 'apy7D', title: 'Apy 7D', sortBy: 'apy7D' },
]

const bSmeaders: Partial<HeaderId>[] = ['pair', 'tvl', 'volume24H']
const smHeaders: Partial<HeaderId>[] = [...bSmeaders, 'apy24H']
const mdHeaders: Partial<HeaderId>[] = [...smHeaders, 'apy7D', 'volume7D']

const DataRow = ({
  poolData,
  isLastIndex,
  isBelowSm,
  isMobile,
}: {
  poolData: PoolParsed
  isLastIndex: boolean
  isBelowSm: boolean
  isMobile: boolean
}) => {
  return (
    <tr
      className={clsx('bg-surface-raised text-sm', {
        'border-b border-border': !isLastIndex,
      })}
    >
      <td className="text-on-surface px-4 xs:px-6 py-6 text-left">
        <div className="flex flex-col xs:flex-row items-start xs:items-center gap-2 sm">
          <CurrencyLogoWithSymbol
            addressA={poolData.token0.id}
            addressB={poolData.token1.id}
            symbol={`${poolData.token0.symbol}/${poolData.token1.symbol}`}
            spaceX="gap-2"
            flex="flex flex-col items-start gap-2 xs:flex-row xs:items-center"
          />

          {'feeTier' in poolData && <TagV2 color="default">{feeTierPercent(poolData.feeTier)}</TagV2>}
        </div>
      </td>
      <td className="text-on-surface px-4 py-6 text-left">
        <span>{formatDollarAmount(poolData.tvlUSD)}</span>
      </td>
      <td className="text-on-surface px-4 py-6 text-left">
        <span>{formatDollarAmount(poolData.volumeUSD['24H'])}</span>
      </td>
      {!isBelowSm && <td className="text-on-surface px-4 py-6 text-left">{getPercentage(poolData.apy['24H'])}</td>}

      {!isMobile && (
        <td className="text-on-surface px-4 py-6 text-left">{formatDollarAmount(poolData.volumeUSD['7D'])}</td>
      )}
      {!isMobile && <td className="text-on-surface px-4 py-6 text-left">{getPercentage(poolData.apy['7D'])}</td>}
    </tr>
  )
}

const SHOW_POOL_COUNT = 10

export default function PoolTable({ poolType, searchInput }: { poolType: DashboardPoolType; searchInput?: string }) {
  const { t } = useTranslation()

  // for sorting
  const [sortBy, setSortBy] = useState<PoolsSortBy>('tvl')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  // pagination
  const [skip, setSkip] = useState(0)
  const page = useMemo(() => Math.floor(skip / SHOW_POOL_COUNT) + 1, [skip])
  const handlePagination = useCallback((newPage: number) => setSkip((newPage - 1) * SHOW_POOL_COUNT), [])
  const [_totalPage, setTotalPage] = useState(1)

  const [poolList, setPoolList] = useState<PoolParsed[] | null>(null)

  const { poolsData, totalPage } = usePools({
    poolTypes: [poolType],
    skip,
    searchKey: searchInput,
    sortBy,
    sortDirection,
  })
  useEffect(() => {
    if (!poolsData) return

    setPoolList(poolsData)
  }, [poolsData])
  useEffect(() => {
    if (totalPage === undefined) return

    setTotalPage(totalPage)
  }, [totalPage])

  useEffect(() => {
    setSkip(0)
  }, [searchInput])

  const handleSort = useCallback(
    (newField: PoolsSortBy) => {
      setSortBy(newField)
      setSortDirection(sortBy !== newField ? 'desc' : sortDirection === 'desc' ? 'asc' : 'desc')
      setSkip(0)
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
          {!isBelowSm && <col width="100px" />}
          {!isMobile && <col width="110px" />}
          {!isMobile && <col width="100px" />}
        </colgroup>
        <thead>
          <tr className="text-on-surface-subtle bg-neutral text-xs">
            {headers.map(({ title, sortBy: s }, index) => (
              <th
                key={`poolTable:${s}`}
                className={clsx('py-3 text-left', {
                  'px-4 xs:px-6': index === 0,
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
          {!poolList ? (
            <tr>
              <td colSpan={headers.length} className="h-[250px] md:h-[300px] text-center">
                <div className="flex items-center justify-center w-full">
                  <Spinner />
                </div>
              </td>
            </tr>
          ) : poolList.length > 0 ? (
            poolList.map((poolData, index) => (
              <DataRow
                key={`tokenTable:${poolData.id}`}
                poolData={poolData}
                isLastIndex={index === poolList.length - 1}
                isBelowSm={isBelowSm}
                isMobile={isMobile}
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

      <Pagination page={page} setPage={handlePagination} totalPage={_totalPage} />
    </>
  )
}
