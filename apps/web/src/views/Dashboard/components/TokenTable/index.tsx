import { useTranslation } from '@pancakeswap/localization'
import { Spinner, useMatchBreakpoints } from '@pancakeswap/uikit'
import clsx from 'clsx'
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import { PoolType } from 'types'
import Pagination from 'views/Dashboard/components/Pagination'
import SortHeaderButton from 'views/Dashboard/components/SortHeaderButton'
import { TokenDataRow, TokenDataRowSkeleton } from 'views/Dashboard/components/TokenTable/TokenDataRow'
import useTokensData, { TokensSortBy } from 'views/Dashboard/hooks/useTokensData'
import { SortDirection } from 'views/Dashboard/types'

const HEADER_IDS = ['name', 'price', 'priceChange24H', 'priceChange7D', 'volume24H', 'volume7D', 'tvl'] as const
type HeaderId = (typeof HEADER_IDS)[number]

const TITLES = ['Name', 'Price', 'Price Change', 'Price Change 7D', 'Volume 24H', 'Volume 7D', 'TVL'] as const
type Title = (typeof TITLES)[number]

const HEADERS: {
  id: HeaderId
  title: Title | ReactNode
  sortBy?: TokensSortBy
}[] = [
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
  },
  { id: 'volume24H', title: 'Volume 24H', sortBy: 'volume24H' },
  { id: 'volume7D', title: 'Volume 7D', sortBy: 'volume7D' },
  { id: 'tvl', title: 'TVL', sortBy: 'tvl' },
]

const bsHeaders: Partial<HeaderId>[] = ['name', 'price', 'priceChange24H']
const bSmHeaders: Partial<HeaderId>[] = [...bsHeaders, 'volume24H']
const mobileHeaders: Partial<HeaderId>[] = [...bSmHeaders, 'tvl']

const SHOW_TOKENS_COUNT = 10

export default function TokenTable({
  poolType,
  searchInput,
}: {
  poolType: PoolType
  maxItems?: number
  searchInput?: string
}) {
  const { t } = useTranslation()

  // for sorting
  const [sortBy, setSortBy] = useState<TokensSortBy>('volume24H')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  // pagination
  const [page, setPage] = useState(1)
  const skip = (page - 1) * SHOW_TOKENS_COUNT
  const [_totalPage, setTotalPage] = useState(1)

  const [isFirstRender, setIsFirstRender] = useState(true)

  const { tokensData, totalPage } = useTokensData({
    poolType,
    skip,
    sortBy,
    sortDirection,
    searchKey: searchInput,
  })

  useEffect(() => {
    if (tokensData && tokensData.length > 0) {
      setIsFirstRender(false)
    }
  }, [tokensData])

  useEffect(() => {
    if (totalPage === undefined) return

    setTotalPage(totalPage)
  }, [totalPage])

  useEffect(() => {
    setPage(1)
  }, [searchInput, poolType])

  const handleSort = useCallback(
    (newField: TokensSortBy) => {
      setSortBy(newField)
      setSortDirection(sortBy !== newField ? 'desc' : sortDirection === 'desc' ? 'asc' : 'desc')
      setPage(1)
    },
    [sortDirection, sortBy],
  )

  const { isMobile, isBelowS, isBelowSm } = useMatchBreakpoints()

  const headers = useMemo(
    () =>
      HEADERS.filter(({ id }) =>
        isBelowS
          ? bsHeaders.includes(id)
          : isBelowSm
          ? bSmHeaders.includes(id)
          : isMobile
          ? mobileHeaders.includes(id)
          : true,
      ),
    [isBelowSm, isBelowS, isMobile],
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
          <tr className="text-on-surface-subtle bg-neutral text-xs">
            {headers.map(({ title, sortBy: s }, index) => (
              <th
                key={`tokenTable:header:${title}`}
                className={clsx('py-3 text-left', {
                  'px-4 s:px-6': index === 0,
                  'px-4': index !== 0,
                })}
              >
                {s ? (
                  <SortHeaderButton
                    title={title}
                    onClick={() => handleSort(s)}
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
              <td colSpan={headers.length} className="h-[250px] md:h-[300px] text-center s">
                <div className="flex items-center justify-center w-full">
                  <Spinner />
                </div>
              </td>
            </tr>
          ) : !tokensData ? (
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
              <td colSpan={headers.length} className="h-[250px] md:h-[300px] text-center">
                <div className="flex items-center justify-center w-full">
                  <p className="text-on-surface">{t('No Tokens')}</p>
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
