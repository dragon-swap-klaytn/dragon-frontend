import { useTranslation } from '@pancakeswap/localization'
import {
  useSelectedWallet,
  WalletConnectorNotFoundError,
  WalletStorageKey,
  WalletSwitchChainError,
} from '@pancakeswap/ui-wallets'
import replaceBrowserHistory from '@pancakeswap/utils/replaceBrowserHistory'
import { CHAIN_QUERY_NAME } from 'config/chains'
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
  const { isConnected } = useAccount()
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
          replaceBrowserHistory('chain', CHAIN_QUERY_NAME[connected.chain.id])
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
      localStorage.removeItem(WalletStorageKey.WALLET)
      localStorage.removeItem(WalletStorageKey.CONNECTOR)
      localStorage.removeItem(WalletStorageKey.ADDRESS)

      await disconnectAsync()
      setSelected(null)
    } catch (error) {
      console.error(error)
    } finally {
      // clear web2app state
      clearUserStates(dispatch, { chainId: chain?.id })
    }
  }, [disconnectAsync, dispatch, chain?.id, setSelected])

  return { login, logout }
}

export default useAuth
