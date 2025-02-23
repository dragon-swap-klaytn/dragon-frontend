import { useTranslation } from '@pancakeswap/localization'
import { InjectedModalProps, Modal, SegmentedControl } from '@pancakeswap/uikit'
import { useCallback, useState } from 'react'
import WalletInfo from './WalletInfo'
import WalletTransactions from './WalletTransactions'

export const WalletModalTabs = ['Wallet', 'Transactions'] as const
export type WalletModalTab = (typeof WalletModalTabs)[number]

interface WalletModalProps extends InjectedModalProps {
  initialView?: WalletModalTab
}

interface TabsComponentProps {
  view: WalletModalTab
  handleClick: (newView: WalletModalTab) => void
}

const TabsComponent: React.FC<React.PropsWithChildren<TabsComponentProps>> = ({ view, handleClick }) => {
  return (
    <SegmentedControl
      options={WalletModalTabs as unknown as WalletModalTab[]}
      value={view}
      onChange={handleClick}
      fullWidth
      useTranslationOption
    />
  )
}

const WalletModal: React.FC<React.PropsWithChildren<WalletModalProps>> = ({
  initialView = WalletModalTabs[0],
  onDismiss,
}) => {
  const [view, setView] = useState(initialView)
  const { t } = useTranslation()

  const handleClick = useCallback((newView: WalletModalTab) => {
    setView(newView)
  }, [])

  return (
    <Modal title={t('Your Wallet')} onDismiss={onDismiss} maxWidth="max-w-lg" contentMinHeight="min-h-[300px]">
      <TabsComponent view={view} handleClick={handleClick} />

      {view === 'Wallet' && <WalletInfo onDismiss={onDismiss} />}
      {view === 'Transactions' && <WalletTransactions />}
    </Modal>
  )
}

export default WalletModal
