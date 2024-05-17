import { useEffect } from 'react'
import { useConfig, useConnect } from 'wagmi'

import { CHAINS } from 'config/chains'
import useAuth from 'hooks/useAuth'
import { ConnectorNames } from 'config/wallet'

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

    if (config.storage.getItem('wallet') === ConnectorNames.Klip) {
      const prevAccount = localStorage.getItem('address') ?? ''

      if (prevAccount !== '') {
        login(ConnectorNames.Klip).catch(() => {
          localStorage.removeItem('wallet')
          localStorage.removeItem('address')
        })
      }

      return
    }

    config.autoConnect()
  }, [config, connectAsync, connectors])
}

export default useEagerConnect
