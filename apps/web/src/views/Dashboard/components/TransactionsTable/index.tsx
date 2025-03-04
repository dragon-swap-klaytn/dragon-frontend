import { useTranslation } from '@pancakeswap/localization'
import { ExternalLink, Spinner } from '@pancakeswap/uikit'
import clsx from 'clsx'
import dayjs from 'dayjs'
import { TransactionEventWithType } from 'lib/graph-queries/types'
import { useEffect, useMemo, useState } from 'react'
import { getBlockExploreLink } from 'utils'
import { formatAmount } from 'utils/formatInfoNumbers'
import Pagination from 'views/Dashboard/components/Pagination'
import { OverviewTransaction } from 'views/Dashboard/hooks/useOverviewData'
import { Transaction, TransactionType } from '../../types'
import { formatDollarAmount } from '../../utils/numbers'

const HEADER_IDS = ['summary', 'totalValue', 'amount0', 'amount1', 'time'] as const
type HeaderId = (typeof HEADER_IDS)[number]

type TxTableHeader = {
  id: HeaderId
  title: string
  displayClassName?: string
}

const HEADERS: TxTableHeader[] = [
  { id: 'summary', title: '' },
  { id: 'totalValue', title: 'Total Value', displayClassName: 'hidden s:table-cell' },
  { id: 'amount0', title: 'Token0 Amount' },
  { id: 'amount1', title: 'Token1 Amount' },
  { id: 'time', title: 'Time', displayClassName: 'hidden md:table-cell' },
]

const DataRow = ({ transaction, isLastIndex }: { transaction: TransactionEventWithType; isLastIndex: boolean }) => {
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

      <td className="text-on-surface px-4 py-6 text-left hidden s:table-cell">
        {formatDollarAmount(transaction.amountUSD)}
      </td>

      <td className="text-on-surface px-4 py-6 text-left">
        {formatAmount(abs0)} {token0Symbol}
      </td>
      <td className="text-on-surface px-4 py-6 text-left">
        {formatAmount(abs1)} {token1Symbol}
      </td>

      <td className="text-on-surface px-4 py-6 text-left hidden md:table-cell">
        {dayjs(transaction.timestamp).format('YYYY-MM-DD hh:mm:ss')}
      </td>
    </tr>
  )
}

const SHOW_TRANSACTION_COUNT = 10
export default function TransactionTable({ transactions }: { transactions?: OverviewTransaction }) {
  const { t } = useTranslation()

  // pagination
  const [page, setPage] = useState(1)
  const [totalPage, setTotalPage] = useState(1)

  const [isFirstRender, setIsFirstRender] = useState(true)

  const [filteredTransactions, setFilteredTransactions] = useState<TransactionEventWithType[] | undefined>(undefined)
  useEffect(() => {
    const swaps = (transactions?.swaps ?? []).map((tx) => ({ ...tx, type: TransactionType.SWAP }))
    const adds = (transactions?.mints ?? []).map((tx) => ({ ...tx, type: TransactionType.MINT }))
    const removes = (transactions?.burns ?? []).map((tx) => ({ ...tx, type: TransactionType.BURN }))

    setFilteredTransactions([...swaps, ...adds, ...removes])
  }, [transactions, page])

  useEffect(() => {
    if (filteredTransactions && filteredTransactions.length > 0) {
      setIsFirstRender(false)
    }
  }, [filteredTransactions])

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
          return b['timestamp' as keyof Transaction] - a['timestamp' as keyof Transaction]
        }
        return -1
      })
      .slice(SHOW_TRANSACTION_COUNT * (page - 1), page * SHOW_TRANSACTION_COUNT)
  }, [filteredTransactions, page])

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
            {HEADERS.map(({ title, displayClassName }, index) => (
              <th
                key={`txTable:${title}`}
                className={clsx('py-3 text-left', displayClassName, {
                  'px-4 s:px-6': index === 0,
                  'px-4': index !== 0,
                })}
              >
                <span className="font-medium">{title}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {!isFirstRender &&
            (sortedTransactions && sortedTransactions.length > 0 ? (
              sortedTransactions.map((tx, index) => (
                <DataRow
                  key={`txTable:${tx.txHash}:${index + 1}`}
                  transaction={tx}
                  isLastIndex={index === sortedTransactions.length - 1}
                />
              ))
            ) : (
              <tr>
                <td colSpan={HEADERS.length} className="h-[250px] md:h-[300px] text-center">
                  <div className="flex items-center justify-center w-full">
                    <p className="text-on-surface">{t('No Transactions')}</p>
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

      <Pagination page={page} setPage={setPage} totalPage={totalPage} />
    </>
  )
}
