import { useTranslation } from '@pancakeswap/localization'
import { InjectedModalProps, Modal } from '@pancakeswap/uikit'
import groupBy from 'lodash/groupBy'
import isEmpty from 'lodash/isEmpty'
import { useAllSortedRecentTransactions } from 'state/transactions/hooks'
import { TransactionDetails } from 'state/transactions/reducer'
import { useAccount } from 'wagmi'
import ConnectWalletButton from '../../ConnectWalletButton'
import Transaction from './Transaction'

export function renderTransactions(transactions: TransactionDetails[], chainId: number) {
  return (
    <div className="flex flex-col space-y-5 max-h-80 overflow-y-auto">
      {transactions.map((tx) => {
        return <Transaction key={tx.hash + tx.addedTime} tx={tx} chainId={chainId} />
      })}
    </div>
  )
}

const TransactionsModal: React.FC<React.PropsWithChildren<InjectedModalProps>> = ({ onDismiss }) => {
  const { t } = useTranslation()
  const { address: account } = useAccount()
  const sortedRecentTransactions = useAllSortedRecentTransactions()

  const hasTransactions = !isEmpty(sortedRecentTransactions)

  return (
    <Modal title={t('Recent Transactions')} maxWidth="max-w-lg" onDismiss={onDismiss}>
      {account ? (
        <>
          <p className="text-on-surface-subtlest text-sm">{t('Resets when wallet is disconnected.')}</p>
          {hasTransactions ? (
            <>
              <div>
                {Object.entries(sortedRecentTransactions).map(([chainId, transactions]) => {
                  const chainIdNumber = Number(chainId)
                  const groupedTransactions = groupBy(Object.values(transactions), (trxDetails) =>
                    Boolean(trxDetails.receipt),
                  )

                  const confirmed = groupedTransactions.true ?? []

                  return <div key={`transactions#${chainIdNumber}`}>{renderTransactions(confirmed, chainIdNumber)}</div>
                })}
              </div>
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
