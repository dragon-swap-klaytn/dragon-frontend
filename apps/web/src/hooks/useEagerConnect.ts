import { useEffect } from 'react'
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

    if (config.storage.getItem(WalletStorageKey.WALLET) === WalletIds.klip) {
      const prevAccount = localStorage.getItem(WalletStorageKey.ADDRESS) ?? ''

      if (prevAccount !== '') {
        login(getConnectorId(WalletIds.klip)).catch(() => {
          resetWalletStorage()
        })
      }

      return
    }

    const prevAccount = localStorage.getItem(WalletStorageKey.ADDRESS) ?? ''
    if (!prevAccount) {
      return
    }

    config.autoConnect().then((res) => {
      // @TODO: remove after debugging
      console.log('[autoConnect]', res)
      const connectedAccount = res?.account
      if (!connectedAccount || connectedAccount?.toLowerCase() !== prevAccount.toLowerCase()) {
        logout()
      }
    })
  }, [config, connectAsync, login, logout, account])
}

export default useEagerConnect
