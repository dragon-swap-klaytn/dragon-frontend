import { useTranslation } from '@pancakeswap/localization'
import {
  addressLocalStorageKey,
  WalletConnectorNotFoundError,
  walletLocalStorageKey,
  WalletSwitchChainError,
} from '@pancakeswap/ui-wallets'
import replaceBrowserHistory from '@pancakeswap/utils/replaceBrowserHistory'
import { CHAIN_QUERY_NAME } from 'config/chains'
// import { ConnectorNames } from 'config/wallet'
import { useCallback } from 'react'
import { useAppDispatch } from 'state'
import { ConnectorNotFoundError, SwitchChainNotSupportedError, useConnect, useDisconnect, useNetwork } from 'wagmi'
import { clearUserStates } from '../utils/clearUserStates'
import { useActiveChainId } from './useActiveChainId'
import { useSessionChainId } from './useSessionChainId'

const useAuth = () => {
  const dispatch = useAppDispatch()
  const { connectAsync, connectors } = useConnect()
  const { chain } = useNetwork()
  const { disconnectAsync } = useDisconnect()
  const { chainId } = useActiveChainId()
  const [, setSessionChainId] = useSessionChainId()
  const { t } = useTranslation()

  const login = useCallback(
    async (connectorID: string) => {
      console.log('__connectors', connectors)
      console.log('__connectorID', connectorID)
      const findConnector = connectors.find((c) => c.id === connectorID)
      console.log('__findConnector', findConnector)

      try {
        const connected = await connectAsync({ connector: findConnector, chainId })
        console.log('__connected', connected)
        if (!connected.chain.unsupported && connected.chain.id !== chainId) {
          replaceBrowserHistory('chain', CHAIN_QUERY_NAME[connected.chain.id])
          setSessionChainId(connected.chain.id)
        }
        return connected
      } catch (error) {
        console.log('__error_2', error)
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
    [connectors, connectAsync, chainId, setSessionChainId, t],
  )

  const logout = useCallback(async () => {
    try {
      await disconnectAsync()
    } catch (error) {
      console.error(error)
    } finally {
      // clear web2app state
      localStorage.removeItem(walletLocalStorageKey)
      localStorage.removeItem(addressLocalStorageKey)

      clearUserStates(dispatch, { chainId: chain?.id })
    }
  }, [disconnectAsync, dispatch, chain?.id])

  return { login, logout }
}

export default useAuth
