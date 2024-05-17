import { useMatchBreakpoints } from '@pancakeswap/uikit'
import KlipProvider from '@pancakeswap/wagmi/connectors/klip/interface'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { klipConnector } from 'utils/wagmi'
import { useAccount } from 'wagmi'

let initProviderEvtHandler = false

const useA2AConnectorQRUri = () => {
  const a2aProviderRef = useRef<KlipProvider | null>(null)

  const { connector } = useAccount()

  const { isMobile } = useMatchBreakpoints()

  const [qrUri, setQrUri] = useState('')
  const [requestKey, setRequestKey] = useState('')

  const isA2AConnector = useMemo(() => {
    return connector?.id === 'klip'
  }, [connector])

  const displayUriHandler = useCallback((uri) => {
    setQrUri(uri)
  }, [])

  const requestKeyHandler = useCallback((key) => {
    setRequestKey(key)
  }, [])

  useEffect(() => {
    if (isMobile || !isA2AConnector) return
    if (initProviderEvtHandler) return

    let provider

    initProviderEvtHandler = true
    klipConnector.getProvider().then((klipProvider) => {
      if (!klipProvider) return
      a2aProviderRef.current = klipProvider

      provider = klipProvider
      provider.on('display_uri', displayUriHandler)
      provider.on('requestKey', requestKeyHandler)
    })

    // eslint-disable-next-line consistent-return
    return () => {
      if (provider) {
        provider?.off('display_uri', displayUriHandler)
        provider?.off('requestKey', requestKeyHandler)
        initProviderEvtHandler = false
      }
    }
  }, [isA2AConnector, isMobile, displayUriHandler, requestKeyHandler])

  useEffect(() => {
    return () => {
      if (a2aProviderRef.current && requestKey) {
        a2aProviderRef.current.events.emit('cancelRequest', requestKey)
        a2aProviderRef.current?.off('display_uri', displayUriHandler)
        a2aProviderRef.current?.off('requestKey', requestKeyHandler)
        a2aProviderRef.current = null
        initProviderEvtHandler = false
      }
    }
  }, [a2aProviderRef, requestKey, displayUriHandler, requestKeyHandler])

  return qrUri
}

export default useA2AConnectorQRUri
