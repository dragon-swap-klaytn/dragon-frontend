import { useTranslation } from '@pancakeswap/localization'
import { InjectedModalProps, Modal } from '@pancakeswap/uikit'
import TransactionContent from 'components/App/Transactions/Content'
import { TransactionType } from 'state/transactions/actions'
import { useAccount } from 'wagmi'
import ConnectWalletButton from '../../ConnectWalletButton'

const TransactionsModal: React.FC<
  React.PropsWithChildren<InjectedModalProps & { title?: string; type?: TransactionType }>
> = ({ title, type, onDismiss }) => {
  const { t } = useTranslation()
  const { address: account } = useAccount()

  return (
    <Modal title={title || t('Recent Transactions')} maxWidth="max-w-lg" onDismiss={onDismiss}>
      {account ? <TransactionContent type={type} /> : <ConnectWalletButton />}
    </Modal>
  )
}

export default TransactionsModal
