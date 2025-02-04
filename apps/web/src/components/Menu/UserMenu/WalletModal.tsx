import { useTranslation } from '@pancakeswap/localization'
import { InjectedModalProps, Modal } from '@pancakeswap/uikit'
import clsx from 'clsx'
import { useCallback, useState } from 'react'
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
    <div className="grid grid-cols-2 text-sm bg-neutral rounded-[20px] overflow-hidden">
      {Array.from({ length: 2 }).map((_, index) => (
        <button
          key={`wallet-modal-tab:${index === 0 ? 'Wallet' : 'Transactions'}`}
          type="button"
          className={clsx('hover:opacity-70 py-2 rounded-[20px] text-on-surface', {
            'bg-neutral-pressed': view === index,
            'bg-transparent': view !== index,
          })}
          onClick={() => handleClick(index)}
        >
          {index === 0 ? t('Wallet') : t('Transactions')}
        </button>
      ))}
    </div>
  )
}

const WalletModal: React.FC<React.PropsWithChildren<WalletModalProps>> = ({
  initialView = WalletView.WALLET_INFO,
  onDismiss,
}) => {
  const [view, setView] = useState(initialView)
  const { t } = useTranslation()

  const handleClick = useCallback((newIndex: number) => {
    setView(newIndex)
  }, [])

  return (
    <Modal title={t('Your Wallet')} onDismiss={onDismiss} maxWidth="max-w-lg" contentMinHeight="min-h-[245px]">
      {view !== WalletView.WRONG_NETWORK && <TabsComponent view={view} handleClick={handleClick} />}

      {view === WalletView.WALLET_INFO && <WalletInfo switchView={handleClick} onDismiss={onDismiss} />}
      {view === WalletView.TRANSACTIONS && <WalletTransactions />}
      {view === WalletView.WRONG_NETWORK && <WalletWrongNetwork onDismiss={onDismiss} />}
    </Modal>
  )
}

export default WalletModal
