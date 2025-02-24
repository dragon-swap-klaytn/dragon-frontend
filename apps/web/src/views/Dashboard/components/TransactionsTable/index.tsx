import { useTranslation } from '@pancakeswap/localization'
import { ExternalLink, Spinner, useMatchBreakpoints } from '@pancakeswap/uikit'
import clsx from 'clsx'
import dayjs from 'dayjs'
import { TransactionEventWithType } from 'lib/graph-queries/types'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { getBlockExploreLink } from 'utils'
import { formatAmount } from 'utils/formatInfoNumbers'
import Pagination from 'views/Dashboard/components/Pagination'
import SortHeaderButton from 'views/Dashboard/components/SortHeaderButton'
import { OverviewTransaction } from 'views/Dashboard/hooks/useOverviewData'
import { SortDirection, Transaction, TransactionType } from '../../types'
import { formatDollarAmount } from '../../utils/numbers'

const TRANSACTIONS_SORT_BY_LIST = ['amountUSD', 'timestamp', 'amountToken0', 'amountToken1'] as const
type TxsSortBy = (typeof TRANSACTIONS_SORT_BY_LIST)[number]

const bSHeaders: Partial<TxsSortBy>[] = ['amountToken0', 'amountToken1']
const mobileHeaders: Partial<TxsSortBy>[] = [...bSHeaders, 'amountUSD']

const DataRow = ({
  transaction,
  isLastIndex,
  isMobile,
  isBelowS,
}: {
  transaction: TransactionEventWithType
  isLastIndex: boolean
  isMobile: boolean
  isBelowS: boolean
}) => {
  const abs0 = Math.abs(transaction.amount0)
  const abs1 = Math.abs(transaction.amount1)
  const token0Symbol = useMemo(() => transaction.token0.symbol, [transaction.token0.symbol])
  const token1Symbol = useMemo(() => transaction.token1.symbol, [transaction.token1.symbol])
  const outputTokenSymbol = transaction.amount0 < 0 ? token0Symbol : token1Symbol
  const inputTokenSymbol = transaction.amount1 < 0 ? token0Symbol : token1Symbol

  return (
    <tr
      className={clsx('bg-surface-raised text-sm', {
        'border-b border-border': !isLastIndex,
      })}
    >
      <td className="text-on-surface pl-4 s:pl-6 py-6 text-left text-xs">
        <ExternalLink href={getBlockExploreLink(transaction.txHash, 'transaction')}>
          {transaction.type === TransactionType.MINT
            ? `Add ${token0Symbol} and ${token1Symbol}`
            : transaction.type === TransactionType.SWAP
            ? `Swap ${inputTokenSymbol} for ${outputTokenSymbol}`
            : `Remove ${token0Symbol} and ${token1Symbol}`}
        </ExternalLink>
      </td>
      {!isBelowS && (
        <td className="text-on-surface px-4 py-6 text-left">{formatDollarAmount(transaction.amountUSD)}</td>
      )}
      <td className="text-on-surface px-4 py-6 text-left">
        {formatAmount(abs0)} {token0Symbol}
      </td>
      <td className="text-on-surface px-4 py-6 text-left">
        {formatAmount(abs1)} {token1Symbol}
      </td>
      {!isMobile && (
        <td className="text-on-surface px-4 py-6 text-left">
          {dayjs(transaction.timestamp).format('YYYY-MM-DD hh:mm:ss')}
        </td>
      )}
    </tr>
  )
}

const SHOW_TRANSACTION_COUNT = 10
export default function TransactionTable({
  transactions,
}: {
  // transactions?: Transaction[]
  transactions?: OverviewTransaction
}) {
  const { t } = useTranslation()

  // for sorting
  const [txsSortBy, setTxsSortBy] = useState<TxsSortBy>('timestamp')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  // pagination
  const [page, setPage] = useState(1)
  const [totalPage, setTotalPage] = useState(1)

  const [filteredTransactions, setFilteredTransactions] = useState<TransactionEventWithType[] | undefined>(undefined)
  useEffect(() => {
    const swaps = (transactions?.swaps ?? []).map((tx) => ({ ...tx, type: TransactionType.SWAP }))
    const adds = (transactions?.mints ?? []).map((tx) => ({ ...tx, type: TransactionType.MINT }))
    const removes = (transactions?.burns ?? []).map((tx) => ({ ...tx, type: TransactionType.BURN }))

    setFilteredTransactions([...swaps, ...adds, ...removes])
  }, [transactions])

  useEffect(() => {
    const totalPageResult = Math.ceil((filteredTransactions?.length ?? 0) / SHOW_TRANSACTION_COUNT)

    setTotalPage(totalPageResult)
    if (totalPageResult === 0) setPage(0)
    else setPage(1)
  }, [filteredTransactions])

  const sortedTransactions = useMemo(() => {
    if (!filteredTransactions) return undefined

    return [...filteredTransactions]
      .sort((a, b) => {
        if (a && b) {
          return a[txsSortBy as keyof Transaction] > b[txsSortBy as keyof Transaction]
            ? (sortDirection === 'desc' ? -1 : 1) * 1
            : (sortDirection === 'desc' ? -1 : 1) * -1
        }
        return -1
      })
      .slice(SHOW_TRANSACTION_COUNT * (page - 1), page * SHOW_TRANSACTION_COUNT)
  }, [filteredTransactions, page, txsSortBy, sortDirection])

  const handleSort = useCallback(
    (newField: TxsSortBy) => {
      setTxsSortBy(newField)
      setSortDirection(txsSortBy !== newField ? 'desc' : sortDirection === 'desc' ? 'asc' : 'desc')
      setPage(1)
    },
    [sortDirection, txsSortBy],
  )

  const { isMobile, isBelowS } = useMatchBreakpoints()
  const headers = useMemo(
    () =>
      [
        { title: 'Total Value', TxsSortBy: 'amountUSD' },
        { title: t('Token{{index}} Amount', { index: '0' }), TxsSortBy: 'amountToken0' },
        { title: t('Token{{index}} Amount', { index: '1' }), TxsSortBy: 'amountToken1' },
        { title: 'Time', TxsSortBy: 'timestamp' },
      ].filter(({ TxsSortBy: s }) =>
        isBelowS ? bSHeaders.includes(s as TxsSortBy) : isMobile ? mobileHeaders.includes(s as TxsSortBy) : true,
      ),
    [isMobile, t, isBelowS],
  )

  return (
    <>
      <table className="w-full rounded-xl overflow-hidden">
        <colgroup>
          <col width="30%" />
          <col width="*" />
          <col width="*" />
          <col width="*" />
          <col width="*" />
        </colgroup>
        <thead>
          <tr className="text-on-surface-subtle bg-neutral text-xs">
            <th className="pl-4 s:pl-6 py-3 text-left" />
            {headers.map(({ title, TxsSortBy: s }) => (
              <th key={`txTable:${title}`} className="px-4 py-3 text-left">
                <SortHeaderButton
                  title={title}
                  onClick={() => handleSort(s as TxsSortBy)}
                  isSelected={txsSortBy === s}
                  sortDirection={sortDirection}
                />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {!sortedTransactions ? (
            <tr>
              <td colSpan={headers.length + 1} className="h-[250px] md:h-[300px] text-center">
                <div className="flex items-center justify-center w-full">
                  <Spinner />
                </div>
              </td>
            </tr>
          ) : sortedTransactions.length > 0 ? (
            sortedTransactions.map((tx, index) => (
              <DataRow
                key={`txTable:${tx.txHash}:${index + 1}`}
                transaction={tx}
                isLastIndex={index === sortedTransactions.length - 1}
                isMobile={isMobile}
                isBelowS={isBelowS}
              />
            ))
          ) : (
            <tr>
              <td colSpan={headers.length + 1} className="h-[250px] md:h-[300px] text-center">
                <div className="flex items-center justify-center w-full">
                  <p className="text-on-surface">{t('No Transactions')}</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <Pagination page={page} setPage={setPage} totalPage={totalPage} />
    </>
  )
}
