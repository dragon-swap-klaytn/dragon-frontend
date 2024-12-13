import { useTranslation } from '@pancakeswap/localization'
import { InjectedModalProps, Modal, Text } from '@pancakeswap/uikit'
import Button from 'components/Common/Button'
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

function renderTransactions(transactions: TransactionDetails[], chainId: number) {
  return (
    <div className="flex flex-col space-y-3">
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
              <div className="flex items-center space-x-2 justify-between">
                <h4 className="text-sm">{t('Recent Transactions')}</h4>

                <Button variant="primary" size="xs" onClick={clearAllTransactionsCallback}>
                  {t('clear all')}
                </Button>
              </div>

              <div className="mt-7">
                {Object.entries(sortedRecentTransactions).map(([chainId, transactions]) => {
                  const chainIdNumber = Number(chainId)
                  const groupedTransactions = groupBy(Object.values(transactions), (trxDetails) =>
                    Boolean(trxDetails.receipt),
                  )

                  const confirmed = groupedTransactions.true ?? []
                  const pending = groupedTransactions.false ?? []

                  return (
                    <div key={`transactions#${chainIdNumber}`}>
                      {renderTransactions(pending, chainIdNumber)}
                      {renderTransactions(confirmed, chainIdNumber)}
                    </div>
                  )
                })}
              </div>
            </>
          ) : (
            <Text>{t('No recent transactions')}</Text>
          )}
        </>
      ) : (
        <ConnectWalletButton />
      )}
    </Modal>
  )
}

export default TransactionsModal
