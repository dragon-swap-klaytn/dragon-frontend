import { DEFAULT_CHAIN_ID } from '@pancakeswap/chains'
import { useTranslation } from '@pancakeswap/localization'
import { WalletStorageKey } from '@pancakeswap/ui-wallets'
import { ConnectorId, useModal, WalletId } from '@pancakeswap/uikit'
import { CaretDown } from '@phosphor-icons/react'
import clsx from 'clsx'
import ConnectWalletButton from 'components/ConnectWalletButton'
import WalletModal from 'components/Menu/UserMenu/WalletModal'
import { DEFAULT_WALLET_ICON, getWalletIcon, getWalletIdByConnectorId } from 'config/wallet'
import { useActiveChainId } from 'hooks/useActiveChainId'
import useAuth from 'hooks/useAuth'
import { useSwitchNetworkLocal } from 'hooks/useSwitchNetwork'
import { useWindowSize } from 'hooks/useWindowSize'
import { usePathname } from 'next/navigation'
import { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useAccount } from 'wagmi'

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

  const pathname = usePathname()
  const pathnameRef = useRef(pathname)
  useEffect(() => {
    if (!pathnameRef.current) return
    if (pathnameRef.current !== pathname) {
      setUserMenuOpen(false)
    }

    pathnameRef.current = pathname
  }, [pathname, setUserMenuOpen])

  const { width } = useWindowSize()
  const accountEllipsis = useMemo(
    () => (account ? `${account.substring(0, 4)}...${account.substring(account.length - 4)}` : null),
    [account],
  )
  const { connector } = useAccount()
  const { logout } = useAuth()

  const [onPresentWalletModal] = useModal(<WalletModal initialView="Wallet" />)
  const [onPresentTransactionModal] = useModal(<WalletModal initialView="Transactions" />)

  const onClickWalletMenu = useCallback((): void => {
    onPresentWalletModal()
    setUserMenuOpen(false)
  }, [onPresentWalletModal, setUserMenuOpen])

  const [connectedWalletId, setConnectedWalletId] = useState<WalletId | null>(null)
  useEffect(() => {
    if (!connector) {
      return
    }

    let safeCount = 0
    const intervalId = setInterval(() => {
      const recentConnectorId = localStorage.getItem(WalletStorageKey.CONNECTOR) as ConnectorId

      if (connector) {
        const connectorId = connector.id

        if (!recentConnectorId) {
          const walletId = getWalletIdByConnectorId(connectorId as ConnectorId)
          setConnectedWalletId(walletId)
          clearInterval(intervalId)
        } else if (recentConnectorId === 'kaiawallet') {
          setConnectedWalletId(recentConnectorId)
        } else if (connectorId !== recentConnectorId) {
          setConnectedWalletId(null)
        } else {
          const recentWalletId = localStorage.getItem(WalletStorageKey.WALLET)
          if (recentWalletId) {
            setConnectedWalletId(recentWalletId as WalletId)
            clearInterval(intervalId)
          }
        }
      } else {
        setConnectedWalletId(null)
      }

      safeCount++
      if (safeCount > 100) {
        clearInterval(intervalId)
      }
    }, 10)
  }, [connector])

  if (account) {
    return (
      <div className="relative mr-2">
        <button
          type="button"
          className="flex items-center space-x-2 hover:opacity-70 text-on-surface-inverse pl-1 pr-1.5 py-1 md:pl-1.5 md:pr-2 md:py-2 bg-brand rounded-3xl"
          onClick={() => setUserMenuOpen((prev) => !prev)}
        >
          <div className="w-6 h-6 shrink-0 rounded-full overflow-hidden">
            <img
              src={connectedWalletId ? getWalletIcon(connectedWalletId as WalletId) : DEFAULT_WALLET_ICON}
              alt={`${connectedWalletId || 'wallet'} icon`}
              className="w-full h-full object-cover object-center"
            />
          </div>
          <span className="text-sm">{accountEllipsis}</span>
          <CaretDown size={16} className="inline-block" />
        </button>

        <div
          className={clsx(
            'absolute top-[50px] right-0 bg-surface-overlay p-6 rounded-2xl transition-opacity z-50 min-w-[150px]',
            {
              'opacity-100': userMenuOpen,
              'opacity-0 pointer-events-none': !userMenuOpen,
            },
          )}
        >
          <div className="flex flex-col items-start space-y-6 text-on-surface">
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
    <ConnectWalletButton scaleString="!px-3 !py-1.5 md:!px-4 md:!py-2.5">
      <span className="text-sm">{width < 768 ? t('Connect') : t('Connect Wallet')}</span>
    </ConnectWalletButton>
  )
}

export default UserMenu
