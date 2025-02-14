import { useTranslation } from '@pancakeswap/localization'
import { CurrencyLogoWithSymbol, Spinner, useMatchBreakpoints } from '@pancakeswap/uikit'
import clsx from 'clsx'
import { DashboardPoolType } from 'pages/dashboard'
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import { TokenDetailed } from 'tokens/get-cached-token-stats'
import Pagination from 'views/Dashboard/components/Pagination'
import SortHeaderButton from 'views/Dashboard/components/SortHeaderButton'
import useTokensData, { TokensSortBy } from 'views/Dashboard/hooks/useTokensData'
import { SortDirection } from 'views/Dashboard/types'
import { formatDollarAmount } from '../../utils/numbers'
import Percent from '../Percent'

const DataRow = ({
  tokenData,
  isLastIndex,
  isMobile,
  isBelowSm,
  isBelowS,
}: {
  tokenData: TokenDetailed
  isLastIndex: boolean
  isMobile: boolean
  isBelowSm: boolean
  isBelowS: boolean
}) => {
  return (
    <tr
      className={clsx('bg-surface-raised text-sm', {
        'border-b border-border': !isLastIndex,
      })}
    >
      <td className="text-on-surface px-4 xs:px-6 py-6 text-left">
        <div className="flex items-center space-x-2">
          <CurrencyLogoWithSymbol addressA={tokenData.id} symbol={tokenData.symbol} />

          <span className="text-on-surface-subtlest hidden md:block line-clamp-1">{tokenData.name}</span>
        </div>
      </td>
      <td className="text-on-surface px-4 py-6 text-left">{formatDollarAmount(tokenData.priceUSD.current)}</td>
      <td className="text-on-surface px-4 py-6 text-left">
        <Percent value={(tokenData.priceUSD['24H'] / tokenData.priceUSD.current) * 100} />
      </td>
      {!isMobile && (
        <td className="text-on-surface px-4 py-6 text-left">
          <Percent value={(tokenData.priceUSD['7D'] / tokenData.priceUSD.current) * 100} />
        </td>
      )}
      {!isBelowS && (
        <td className="text-on-surface px-4 py-6 text-left">{formatDollarAmount(tokenData.volumeUSD['24H'])}</td>
      )}
      {!isMobile && (
        <td className="text-on-surface px-4 py-6 text-left">{formatDollarAmount(tokenData.volumeUSD['7D'])}</td>
      )}
      {!isBelowSm && <td className="text-on-surface px-4 py-6 text-left">{formatDollarAmount(tokenData.tvlUSD)}</td>}
    </tr>
  )
}

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
  { id: 'priceChange24H', title: 'Price Change' },
  {
    id: 'priceChange7D',
    title: (
      <span>
        Price <span className="inline-block whitespace-nowrap">Change 7D</span>
      </span>
    ),
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
  poolType: DashboardPoolType
  maxItems?: number
  searchInput?: string
}) {
  const { t } = useTranslation()

  // for sorting
  const [sortBy, setSortBy] = useState<TokensSortBy>('volume24H')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  // pagination
  const [skip, setSkip] = useState(0)
  const page = useMemo(() => Math.floor(skip / SHOW_TOKENS_COUNT) + 1, [skip])
  const handlePagination = useCallback((newPage: number) => setSkip((newPage - 1) * SHOW_TOKENS_COUNT), [])
  const [_totalPage, setTotalPage] = useState(1)

  const [tokenList, setTokenList] = useState<TokenDetailed[] | null>(null)

  const { tokensData, totalPage } = useTokensData({ poolType, skip, sortBy, sortDirection, searchKey: searchInput })
  useEffect(() => {
    if (!tokensData) return

    setTokenList(tokensData)
  }, [tokensData])
  useEffect(() => {
    if (totalPage === undefined) return

    setTotalPage(totalPage)
  }, [totalPage])
  useEffect(() => {
    setSkip(0)
  }, [searchInput])

  const handleSort = useCallback(
    (newField: TokensSortBy) => {
      setSortBy(newField)
      setSortDirection(sortBy !== newField ? 'desc' : sortDirection === 'desc' ? 'asc' : 'desc')
      setSkip(0)
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
                key={`tokenTable:${title}`}
                className={clsx('py-3 text-left', {
                  'px-4 xs:px-6': index === 0,
                  'px-4': index !== 0,
                })}
              >
                <SortHeaderButton
                  title={title}
                  onClick={() => handleSort(s as TokensSortBy)}
                  isSelected={sortBy === s}
                  sortDirection={sortDirection}
                />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {!tokenList ? (
            <tr>
              <td colSpan={headers.length} className="h-[250px] md:h-[300px] text-center">
                <div className="flex items-center justify-center w-full">
                  <Spinner />
                </div>
              </td>
            </tr>
          ) : tokenList.length > 0 ? (
            tokenList.map((tokenData, index) => (
              <DataRow
                key={`tokenTable:${tokenData.id}`}
                tokenData={tokenData}
                isLastIndex={index === tokenList.length - 1}
                isMobile={isMobile}
                isBelowS={isBelowS}
                isBelowSm={isBelowSm}
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

      <Pagination page={page} setPage={handlePagination} totalPage={_totalPage} />
    </>
  )
}
