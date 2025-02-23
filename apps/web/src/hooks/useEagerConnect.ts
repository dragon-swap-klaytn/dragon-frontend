import { useCallback, useEffect } from 'react'
import { useAccount, useConfig, useConnect } from 'wagmi'

import { resetWalletStorage, WalletStorageKey } from '@pancakeswap/ui-wallets'
import { WalletIds } from '@pancakeswap/uikit'
import { CHAINS } from 'config/chains'
import { getConnectorId } from 'config/wallet'
import useAuth from 'hooks/useAuth'

const useEagerConnect = () => {
  const config = useConfig()
  const { connectAsync } = useConnect()
  const { login, logout } = useAuth()
  const { address: account } = useAccount()

  const init = useCallback(() => {
    logout()
    resetWalletStorage()
  }, [logout])

  useEffect(() => {
    console.log('[useEagerConnect] start')

    if (
      !(typeof window === 'undefined') &&
      window?.parent !== window &&
      // @ts-ignore
      !window.cy
    ) {
      import('wagmi/connectors/safe').then(({ SafeConnector }) => {
        const safe = new SafeConnector({ chains: CHAINS })
        connectAsync({ connector: safe }).catch(() => {
          config.autoConnect()
        })
      })
      return
    }

    const prevAccount = localStorage.getItem(WalletStorageKey.ADDRESS) ?? ''
    const prevConnectorId = localStorage.getItem(WalletStorageKey.CONNECTOR) ?? ''
    const prevWalletId = localStorage.getItem(WalletStorageKey.WALLET) ?? ''

    if (!prevAccount || !prevConnectorId || !prevWalletId) {
      console.log('[useEagerConnect] no data', prevAccount, prevConnectorId, prevWalletId)
      init()
      return
    }

    console.log('[useEagerConnect] step1')

    if (config.storage.getItem(WalletStorageKey.WALLET) === WalletIds.klip) {
      console.log('[useEagerConnect_klip] prevAccount', prevAccount)

      if (prevAccount !== '') {
        login(getConnectorId(WalletIds.klip)).catch(() => {
          init()
        })
      }

      return
    }

    console.log('[useEagerConnect] step2')

    config.autoConnect().then((res) => {
      // @TODO: remove after debugging
      console.log('[useEagerConnect_autoConnect]', res)
      const connectedAccount = res?.account
      if (!connectedAccount || connectedAccount?.toLowerCase() !== prevAccount.toLowerCase()) {
        init()
      }
    })
  }, [config, connectAsync, login, logout, account, init])
}

export default useEagerConnect
