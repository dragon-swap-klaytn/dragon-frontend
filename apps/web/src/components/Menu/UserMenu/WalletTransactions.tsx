import { useTranslation } from '@pancakeswap/localization'
import { ButtonV2 } from '@pancakeswap/uikit'
import clsx from 'clsx'
import { renderTransactions } from 'components/App/Transactions/TransactionsModal'
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
    <div
      className={clsx('mt-4', {
        'flex flex-grow items-center justify-center': !hasTransactions,
      })}
    >
      {hasTransactions && (
        <div className="flex items-center space-x-2 px-2 w-full justify-between">
          <h4 className="text-sm text-on-surface font-bold">{t('Recent Transactions')}</h4>

          <ButtonV2 scale="sm" onClick={handleClearAll} variant="subtle">
            {t('Clear all')}
          </ButtonV2>
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
        <p className="text-on-surface">{t('No recent transactions')}</p>
      )}
    </div>
  )
}

export default WalletTransactions
