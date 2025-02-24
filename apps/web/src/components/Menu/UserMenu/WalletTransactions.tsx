import { useTranslation } from '@pancakeswap/localization'
import clsx from 'clsx'
import { renderTransactions } from 'components/App/Transactions/TransactionsModal'
import groupBy from 'lodash/groupBy'
import isEmpty from 'lodash/isEmpty'
import { useAllSortedRecentTransactions } from 'state/transactions/hooks'

const WalletTransactions: React.FC<React.PropsWithChildren> = () => {
  const { t } = useTranslation()
  const sortedTransactions = useAllSortedRecentTransactions()
  const hasTransactions = !isEmpty(sortedTransactions)

  return (
    <>
      <p className="mt-4 text-right text-on-surface-subtlest text-sm">{t('Resets when wallet is disconnected.')}</p>
      <div
        className={clsx('mt-4', {
          'flex flex-grow items-center justify-center': !hasTransactions,
        })}
      >
        {hasTransactions && (
          <>
            <div className="flex items-center space-x-2 px-2 w-full justify-between">
              <h4 className="text-xs text-on-surface-brand-subtle font-bold">{t('Recent Transactions')}</h4>
            </div>
          </>
        )}

        {hasTransactions ? (
          <div className="mt-7 px-2">
            {Object.entries(sortedTransactions).map(([chainId, transactions]) => {
              const chainIdNumber = Number(chainId)
              const groupedTransactions = groupBy(Object.values(transactions), (trxDetails) =>
                Boolean(trxDetails.receipt),
              )

              const confirmed = groupedTransactions.true ?? []

              return (
                <div key={`wallet:transactions#${chainIdNumber}`}>{renderTransactions(confirmed, chainIdNumber)}</div>
              )
            })}
          </div>
        ) : (
          <p className="text-on-surface">{t('No recent transactions')}</p>
        )}
      </div>
    </>
  )
}

export default WalletTransactions
