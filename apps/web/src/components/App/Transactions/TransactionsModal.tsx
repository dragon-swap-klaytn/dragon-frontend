import { useTranslation } from '@pancakeswap/localization'
import { ButtonV2, InjectedModalProps, Modal } from '@pancakeswap/uikit'
import groupBy from 'lodash/groupBy'
import isEmpty from 'lodash/isEmpty'
import { useCallback } from 'react'
import { useAppDispatch } from 'state'
import { clearAllTransactions } from 'state/transactions/actions'
import { useAllSortedRecentTransactions } from 'state/transactions/hooks'
import { TransactionDetails } from 'state/transactions/reducer'
import { useAccount } from 'wagmi'
import ConnectWalletButton from '../../ConnectWalletButton'
import Transaction from './Transaction'

export function renderTransactions(transactions: TransactionDetails[], chainId: number) {
  return (
    <div className="flex flex-col space-y-3 max-h-80 overflow-y-auto">
      {transactions.map((tx) => {
        return <Transaction key={tx.hash + tx.addedTime} tx={tx} chainId={chainId} />
      })}
    </div>
  )
}

const TransactionsModal: React.FC<React.PropsWithChildren<InjectedModalProps>> = ({ onDismiss }) => {
  const { address: account } = useAccount()
  const dispatch = useAppDispatch()
  const sortedRecentTransactions = useAllSortedRecentTransactions()

  const { t } = useTranslation()

  const hasTransactions = !isEmpty(sortedRecentTransactions)

  const clearAllTransactionsCallback = useCallback(() => {
    dispatch(clearAllTransactions())
  }, [dispatch])

  return (
    <Modal title={t('Recent Transactions')} maxWidth="max-w-lg" onDismiss={onDismiss}>
      {account ? (
        <>
          {hasTransactions ? (
            <>
              <div>
                {Object.entries(sortedRecentTransactions).map(([chainId, transactions]) => {
                  const chainIdNumber = Number(chainId)
                  const groupedTransactions = groupBy(Object.values(transactions), (trxDetails) =>
                    Boolean(trxDetails.receipt),
                  )

                  const confirmed = groupedTransactions.true ?? []
                  // const pending = groupedTransactions.false ?? []

                  return (
                    <div key={`transactions#${chainIdNumber}`}>
                      {/* {renderTransactions(pending, chainIdNumber)} */}
                      {renderTransactions(confirmed, chainIdNumber)}
                    </div>
                  )
                })}
              </div>

              <ButtonV2 scale="sm" onClick={clearAllTransactionsCallback} variant="subtle" fullWidth className="mt-7">
                {t('Clear all')}
              </ButtonV2>
            </>
          ) : (
            <p className="text-center py-6 text-on-surface">{t('No recent transactions')}</p>
          )}
        </>
      ) : (
        <ConnectWalletButton />
      )}
    </Modal>
  )
}

export default TransactionsModal
