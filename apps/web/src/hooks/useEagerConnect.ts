import { useEffect } from 'react'
import { useConfig, useConnect } from 'wagmi'

import { CHAINS } from 'config/chains'
import { getConnectorId, WalletIds } from 'config/wallet'
import useAuth from 'hooks/useAuth'

const useEagerConnect = () => {
  const config = useConfig()
  const { connectAsync, connectors } = useConnect()
  const { login } = useAuth()

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

    const connectorId = getConnectorId(WalletIds.klip)
    if (connectorId && config.storage.getItem('wallet') === connectorId) {
      const prevAccount = localStorage.getItem('address') ?? ''

      if (prevAccount !== '') {
        login(connectorId).catch(() => {
          localStorage.removeItem('wallet')
          localStorage.removeItem('address')
        })
      }

      return
    }

    config.autoConnect()
  }, [config, connectAsync, connectors, login])
}

export default useEagerConnect
