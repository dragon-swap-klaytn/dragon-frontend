import Transaction from 'components/App/Transactions/Transaction'
import { useTranslation } from 'next-i18next'
import { useMemo } from 'react'
import { TransactionType } from 'state/transactions/actions'
import { useRecentTransactionsFromLs } from 'state/transactions/hooks'

export default function TransactionContent({ className, type }: { className?: string; type?: TransactionType }) {
  const { t } = useTranslation()
  const recentTransactions = useRecentTransactionsFromLs()
  const filteredTransactions = useMemo(() => {
    if (!recentTransactions || Object.keys(recentTransactions).length === 0) return []

    return type
      ? recentTransactions[type]
      : Object.values(recentTransactions)
          .flatMap((txs) => txs)
          .sort((a, b) => b.addedTime - a.addedTime)
          .slice(0, 30)
  }, [recentTransactions, type])

  return (
    <div className={className}>
      <p className="text-on-surface-subtlest text-sm mb-4">{t('Up to 30 txs will be displayed.')}</p>

      {filteredTransactions.length > 0 ? (
        <div className="flex flex-col space-y-5 max-h-80 overflow-y-auto">
          {filteredTransactions.map((transaction) => (
            <Transaction key={`transactions:${transaction.hash}`} tx={transaction} />
          ))}
        </div>
      ) : (
        <p className="text-center py-6 text-on-surface">{t('No recent transactions')}</p>
      )}
    </div>
  )
}
