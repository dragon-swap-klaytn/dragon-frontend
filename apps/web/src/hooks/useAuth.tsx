import { useTranslation } from '@pancakeswap/localization'
import {
  recentlyConnectedWalletIdsAtom,
  resetWalletStorage,
  useSelectedWallet,
  WalletConnectorNotFoundError,
  WalletStorageKey,
  WalletSwitchChainError,
} from '@pancakeswap/ui-wallets'
import { ConnectorId, ConnectorIds, WalletId } from '@pancakeswap/uikit'
import { getWalletIdByConnectorId } from 'config/wallet'
import { useAtom } from 'jotai'
import { useCallback, useRef } from 'react'
import { useAppDispatch } from 'state'
import {
  ConnectorNotFoundError,
  SwitchChainNotSupportedError,
  useAccount,
  useConnect,
  useDisconnect,
  useNetwork,
} from 'wagmi'
import { clearUserStates } from '../utils/clearUserStates'
import { useActiveChainId } from './useActiveChainId'
import { useSessionChainId } from './useSessionChainId'

const useAuth = () => {
  const dispatch = useAppDispatch()
  const { isConnected, connector } = useAccount()
  const { connectAsync, connectors } = useConnect()
  const { chain } = useNetwork()
  const { disconnectAsync } = useDisconnect()
  const { chainId } = useActiveChainId()
  const [, setSessionChainId] = useSessionChainId()
  const { t } = useTranslation()
  const [, setSelected] = useSelectedWallet()

  const lastRequestedConnectorIdRef = useRef('')

  const [, setRecentlyConnectedWalletIds] = useAtom(recentlyConnectedWalletIdsAtom)

  const login = useCallback(
    async (connectorID: string) => {
      if (isConnected) {
        return undefined
      }

      const findConnector = connectors.find((c) => c.id === connectorID)
      if (!findConnector) {
        throw new WalletConnectorNotFoundError(t('Wallet Connector not found'))
      }

      lastRequestedConnectorIdRef.current = connectorID
      try {
        const connected = await connectAsync({ connector: findConnector, chainId }).catch((error) => {
          setSelected(null)
          throw error
        })

        if (!connected.account || connected.chain.unsupported || connected.chain.id !== chainId) {
          await disconnectAsync()
        }

        if (!connected.chain.unsupported && connected.chain.id !== chainId) {
          setSessionChainId(connected.chain.id)
          lastRequestedConnectorIdRef.current = ''
        }

        if (findConnector.id && Object.values(ConnectorIds).includes(findConnector.id as any)) {
          const walletId = getWalletIdByConnectorId(findConnector.id as ConnectorId)

          setRecentlyConnectedWalletIds((prev) => {
            const newWalletIds: WalletId[] = []

            if (prev.includes(walletId)) {
              newWalletIds.push(walletId, ...prev.filter((id) => id !== walletId))
            } else {
              newWalletIds.push(walletId, ...prev)
            }

            localStorage?.setItem(WalletStorageKey.RECENTLY_CONNECTED, JSON.stringify(newWalletIds))
            return newWalletIds
          })
        }

        return connected
      } catch (error) {
        if (error instanceof ConnectorNotFoundError) {
          throw new WalletConnectorNotFoundError()
        }
        if (
          error instanceof SwitchChainNotSupportedError
          // TODO: wagmi
          // || error instanceof SwitchChainError
        ) {
          throw new WalletSwitchChainError(t('Unable to switch network. Please try it on your wallet'))
        }
      }
      return undefined
    },
    [
      connectors,
      connectAsync,
      chainId,
      setSessionChainId,
      t,
      disconnectAsync,
      setSelected,
      isConnected,
      setRecentlyConnectedWalletIds,
    ],
  )

  const logout = useCallback(async () => {
    try {
      resetWalletStorage()

      if (connector && connector.id === ConnectorIds.unifiWallet) {
        const provider = await connector.getProvider()
        if (provider) {
          await provider.disconnectWallet()
          window.location.reload()
        }
      }

      await disconnectAsync()
      setSelected(null)
    } catch (error) {
      console.error(error)
    } finally {
      // clear web2app state
      clearUserStates(dispatch, { chainId: chain?.id })
    }
  }, [disconnectAsync, dispatch, chain?.id, setSelected, connector])

  return { login, logout }
}

export default useAuth
