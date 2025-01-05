import { DEFAULT_CHAIN_ID } from '@pancakeswap/chains'
import { useTranslation } from '@pancakeswap/localization'
import { useModal } from '@pancakeswap/uikit'
import { CaretDown } from '@phosphor-icons/react'
import clsx from 'clsx'
import ConnectWalletButton from 'components/ConnectWalletButton'
import { ConnectorId, getWalletIconByConnectorId } from 'config/wallet'
import { useActiveChainId } from 'hooks/useActiveChainId'
import useAuth from 'hooks/useAuth'
import { useSwitchNetworkLocal } from 'hooks/useSwitchNetwork'
import { useWindowSize } from 'hooks/useWindowSize'
import { Dispatch, SetStateAction, useCallback } from 'react'
import { useAccount } from 'wagmi'
import WalletModal, { WalletView } from './WalletModal'

const UserMenu = ({
  userMenuOpen,
  setUserMenuOpen,
}: {
  userMenuOpen: boolean
  setUserMenuOpen: Dispatch<SetStateAction<boolean>>
}) => {
  const { t } = useTranslation()
  const { address: account } = useAccount()
  const { isWrongNetwork } = useActiveChainId()
  const switchNetworkLocal = useSwitchNetworkLocal()

  const { width } = useWindowSize()
  const accountEllipsis = account ? `${account.substring(0, 4)}...${account.substring(account.length - 4)}` : null
  const { connector } = useAccount()
  const { logout } = useAuth()

  const [onPresentWalletModal] = useModal(<WalletModal initialView={WalletView.WALLET_INFO} />)
  const [onPresentTransactionModal] = useModal(<WalletModal initialView={WalletView.TRANSACTIONS} />)
  const [onPresentWrongNetworkModal] = useModal(<WalletModal initialView={WalletView.WRONG_NETWORK} />)

  const onClickWalletMenu = useCallback((): void => {
    if (isWrongNetwork) {
      onPresentWrongNetworkModal()
    } else {
      onPresentWalletModal()
    }

    setUserMenuOpen(false)
  }, [isWrongNetwork, onPresentWalletModal, onPresentWrongNetworkModal, setUserMenuOpen])

  if (account) {
    return (
      <div className="relative mr-3">
        <button
          type="button"
          className="flex items-center space-x-2 hover:opacity-70 text-on-surface-orange pl-1.5 pr-2 py-1.5 bg-surface-orange rounded-3xl"
          onClick={() => setUserMenuOpen((prev) => !prev)}
        >
          {connector && (
            <div className="w-6 h-6 shrink-0 rounded-full overflow-hidden">
              <img
                src={getWalletIconByConnectorId(connector.id as ConnectorId)}
                alt="avatar"
                className="w-full h-full object-cover object-center"
              />
            </div>
          )}

          <span className="text-sm">{accountEllipsis}</span>
          <CaretDown size={16} className="inline-block" />
        </button>

        <div
          className={clsx('absolute top-12 right-0 bg-surface-container-high p-6 rounded-2xl transition-opacity z-50', {
            'opacity-100': userMenuOpen,
            'opacity-0 pointer-events-none': !userMenuOpen,
          })}
        >
          <h3 className="text-on-surface-primary font-bold text-lg">{t('Preferences')}</h3>

          <div className="mt-[30px] flex flex-col items-start space-y-6 text-on-surface-primary">
            <button
              type="button"
              className="text-sm whitespace-nowrap"
              onClick={() => {
                onClickWalletMenu()
                setUserMenuOpen(false)
              }}
            >
              {t('Wallet')}
            </button>
            <button
              type="button"
              className="text-sm whitespace-nowrap"
              onClick={() => {
                onPresentTransactionModal()
                setUserMenuOpen(false)
              }}
            >
              {t('Recent Transactions')}
            </button>
            <button
              type="button"
              className="text-sm whitespace-nowrap"
              onClick={() => {
                logout().then(() => {
                  if (isWrongNetwork) {
                    switchNetworkLocal(DEFAULT_CHAIN_ID)
                  }
                })

                setUserMenuOpen(false)
              }}
            >
              {t('Disconnect')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <ConnectWalletButton>
      <span className="text-sm">{width < 768 ? t('Connect') : t('Connect Wallet')}</span>
    </ConnectWalletButton>
  )
}

export default UserMenu
