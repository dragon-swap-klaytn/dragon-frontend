import { useTranslation } from '@pancakeswap/localization'
import {
  resetWalletStorage,
  useSelectedWallet,
  WalletConnectorNotFoundError,
  WalletSwitchChainError,
} from '@pancakeswap/ui-wallets'
import { ConnectorIds } from '@pancakeswap/uikit'
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

  const login = useCallback(
    async (connectorID: string) => {
      if (isConnected) {
        return undefined
      }
      const findConnector = connectors.find((c) => c.id === connectorID)

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
    [connectors, connectAsync, chainId, setSessionChainId, t, disconnectAsync, setSelected, isConnected],
  )

  const logout = useCallback(async () => {
    try {
      resetWalletStorage()

      if (connector && connector.id === ConnectorIds.dappPortalWallet) {
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
