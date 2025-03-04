import { useTranslation } from '@pancakeswap/localization'
import { Spinner } from '@pancakeswap/uikit'
import clsx from 'clsx'
import { ReactNode, useCallback, useEffect, useState } from 'react'
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
          {!isFirstRender &&
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

      {isFirstRender && (
        <div className="flex items-center justify-center w-full h-[250px] md:h-[300px]">
          <Spinner />
        </div>
      )}

      <Pagination page={page} setPage={setPage} totalPage={_totalPage} />
    </>
  )
}
