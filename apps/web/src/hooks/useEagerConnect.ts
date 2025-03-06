import { useCallback, useEffect, useState } from 'react'
import { useConfig, useConnect } from 'wagmi'

import { resetWalletStorage, WalletStorageKey } from '@pancakeswap/ui-wallets'
import { WalletIds } from '@pancakeswap/uikit'
import { CHAINS } from 'config/chains'
import { getConnectorId } from 'config/wallet'
import useAuth from 'hooks/useAuth'

const useEagerConnect = () => {
  const config = useConfig()
  const [isFirstRendering, setIsFirstRendering] = useState(true)
  const { connectAsync } = useConnect()
  const { login, logout } = useAuth()

  const init = useCallback(() => {
    logout()
    resetWalletStorage()
  }, [logout])

  useEffect(() => {
    if (!isFirstRendering) return

    try {
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
        return
      }

      if (config.storage.getItem(WalletStorageKey.WALLET) === WalletIds.klip) {
        if (prevAccount !== '') {
          login(getConnectorId(WalletIds.klip)).catch(() => {
            resetWalletStorage()
          })
        }

        return
      }

      config.autoConnect().then((res) => {
        if (!res || !res?.account) {
          return
        }

        if (res.account.toLowerCase() !== prevAccount.toLowerCase()) {
          init()
        }
      })
    } finally {
      setIsFirstRendering(false)
    }
  }, [config, connectAsync, login, logout, init, isFirstRendering])
}

export default useEagerConnect
