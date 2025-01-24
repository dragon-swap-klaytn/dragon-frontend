import { useEffect } from 'react'
import { useAccount, useConfig, useConnect } from 'wagmi'

import { addressLocalStorageKey, connectorLocalStorageKey, walletLocalStorageKey } from '@pancakeswap/ui-wallets'
import { WalletIds } from '@pancakeswap/uikit'
import { CHAINS } from 'config/chains'
import { getConnectorId } from 'config/wallet'
import useAuth from 'hooks/useAuth'

const useEagerConnect = () => {
  const config = useConfig()
  const { connectAsync } = useConnect()
  const { login, logout } = useAuth()
  const { address: account } = useAccount()

  useEffect(() => {
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

    if (config.storage.getItem(walletLocalStorageKey) === WalletIds.klip) {
      const prevAccount = localStorage.getItem(addressLocalStorageKey) ?? ''

      if (prevAccount !== '') {
        login(getConnectorId(WalletIds.klip)).catch(() => {
          localStorage.removeItem(walletLocalStorageKey)
          localStorage.removeItem(connectorLocalStorageKey)
          localStorage.removeItem(addressLocalStorageKey)
        })
      }

      return
    }

    const prevAccount = localStorage.getItem(addressLocalStorageKey) ?? ''
    if (!prevAccount) {
      return
    }

    config.autoConnect().then((res) => {
      const connectedAccount = res?.account
      if (!connectedAccount) {
        return
      }
      if (connectedAccount?.toLocaleLowerCase() !== prevAccount.toLocaleLowerCase()) {
        logout()
      }
    })
  }, [config, connectAsync, login, logout, account])
}

export default useEagerConnect
