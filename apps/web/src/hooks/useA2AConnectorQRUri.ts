import KlipProvider from '@pancakeswap/wagmi/connectors/klip/interface'
import useKlip from 'hooks/useKlip'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { isMobile } from 'react-device-detect'
import { klipConnector } from 'utils/wagmi'
import { useAccount } from 'wagmi'

let initProviderEvtHandler = false

const useA2AConnectorQRUri = () => {
  const a2aProviderRef = useRef<KlipProvider | null>(null)

  const { connector } = useAccount()

  const [qrUri, setQrUri] = useState('')
  const [requestKey, setRequestKey] = useState('')

  const isA2AConnector = useMemo(() => {
    return connector?.id === 'klip'
  }, [connector])

  const displayUriHandler = useCallback((uri: string) => {
    setQrUri(uri)
  }, [])

  const requestKeyHandler = useCallback((key: string) => {
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
  }, [isA2AConnector, displayUriHandler, requestKeyHandler])

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

  const klip = useKlip()

  const initKlipRequest = useCallback(() => {
    if (!klip) return

    if (!isA2AConnector || !connector) return

    setRequestKey('')
    setQrUri('')
    initProviderEvtHandler = false
  }, [klip, isA2AConnector, connector, setRequestKey, setQrUri])

  const cancelKlipRequest = useCallback(() => {
    if (!klip) return
    if (!isA2AConnector || !connector || !requestKey) return
    if (!klip.cancelRequest) return

    klip.cancelRequest(requestKey)
    initKlipRequest()
  }, [klip, isA2AConnector, connector, requestKey, initKlipRequest])

  return { qrUri, requestKey, isA2AConnector, connector, cancelKlipRequest, initKlipRequest }
}

export default useA2AConnectorQRUri
