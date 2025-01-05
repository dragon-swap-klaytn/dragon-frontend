import { useTranslation } from '@pancakeswap/localization'
import { InjectedModalProps, Modal } from '@pancakeswap/uikit'
import clsx from 'clsx'
import { useCallback, useState } from 'react'
import { useAccount, useBalance } from 'wagmi'
import WalletInfo from './WalletInfo'
import WalletTransactions from './WalletTransactions'
import WalletWrongNetwork from './WalletWrongNetwork'

export enum WalletView {
  WALLET_INFO,
  TRANSACTIONS,
  WRONG_NETWORK,
}

interface WalletModalProps extends InjectedModalProps {
  initialView?: WalletView
}

interface TabsComponentProps {
  view: WalletView
  handleClick: (newIndex: number) => void
}

const TabsComponent: React.FC<React.PropsWithChildren<TabsComponentProps>> = ({ view, handleClick }) => {
  const { t } = useTranslation()

  return (
    <div className="grid grid-cols-2 rounded-[20px] overflow-hidden text-sm">
      <button
        type="button"
        className={clsx('hover:opacity-70 py-2', {
          'bg-surface-orange': view === 0,
          'bg-surface-container-highest text-on-surface-tertiary': view !== 0,
        })}
        onClick={() => handleClick(0)}
      >
        {t('Wallet')}
      </button>

      <button
        type="button"
        className={clsx('hover:opacity-70 py-2', {
          'bg-surface-orange': view === 1,
          'bg-surface-container-highest text-on-surface-tertiary': view !== 1,
        })}
        onClick={() => handleClick(1)}
      >
        {t('Transactions')}
      </button>
    </div>
  )
}

const WalletModal: React.FC<React.PropsWithChildren<WalletModalProps>> = ({
  initialView = WalletView.WALLET_INFO,
  onDismiss,
}) => {
  const [view, setView] = useState(initialView)
  const { t } = useTranslation()
  const { address: account } = useAccount()
  const { data, isFetched } = useBalance({ address: account })

  const handleClick = useCallback((newIndex: number) => {
    setView(newIndex)
  }, [])

  return (
    <Modal title={t('Your Wallet')} onDismiss={onDismiss} maxWidth="max-w-lg">
      {view !== WalletView.WRONG_NETWORK && <TabsComponent view={view} handleClick={handleClick} />}

      {view === WalletView.WALLET_INFO && <WalletInfo switchView={handleClick} onDismiss={onDismiss} />}
      {view === WalletView.TRANSACTIONS && <WalletTransactions />}
      {view === WalletView.WRONG_NETWORK && <WalletWrongNetwork onDismiss={onDismiss} />}
    </Modal>
  )
}

export default WalletModal
