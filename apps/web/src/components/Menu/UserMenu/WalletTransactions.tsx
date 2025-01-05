import { useTranslation } from '@pancakeswap/localization'
import { renderTransactions } from 'components/App/Transactions/TransactionsModal'
import Button from 'components/Common/Button'
import groupBy from 'lodash/groupBy'
import isEmpty from 'lodash/isEmpty'
import { useAppDispatch } from 'state'
import { clearAllTransactions } from 'state/transactions/actions'
import { useAllSortedRecentTransactions } from 'state/transactions/hooks'

const WalletTransactions: React.FC<React.PropsWithChildren> = () => {
  const dispatch = useAppDispatch()
  const { t } = useTranslation()
  const sortedTransactions = useAllSortedRecentTransactions()

  const hasTransactions = !isEmpty(sortedTransactions)

  const handleClearAll = () => {
    dispatch(clearAllTransactions())
  }

  return (
    <div className="mt-4">
      {hasTransactions && (
        <div className="flex items-center space-x-2 px-2 w-full justify-between">
          <h4 className="text-sm text-on-surface-primary font-bold">{t('Recent Transactions')}</h4>

          <Button scale="sm" onClick={handleClearAll} variant="subtle">
            {t('Clear all')}
          </Button>
        </div>
      )}

      {hasTransactions ? (
        <div className="mt-7 px-2">
          {Object.entries(sortedTransactions).map(([chainId, transactions]) => {
            const chainIdNumber = Number(chainId)
            const groupedTransactions = groupBy(Object.values(transactions), (trxDetails) =>
              Boolean(trxDetails.receipt),
            )

            const confirmed = groupedTransactions.true ?? []
            // const pending = groupedTransactions.false ?? []

            return (
              <div key={`wallet:transactions#${chainIdNumber}`}>
                {/* {renderTransactions(pending, chainIdNumber)} */}
                {renderTransactions(confirmed, chainIdNumber)}
              </div>
            )
          })}
        </div>
      ) : (
        <p className="text-center py-6 text-on-surface-primary">{t('No recent transactions')}</p>
      )}
    </div>
  )
}

export default WalletTransactions
