import { ConnectorIds } from '@pancakeswap/uikit'
import useWallets from 'hooks/useWallets'
import { useMemo } from 'react'

export default function useKlip() {
  const wallets = useWallets()
  const klip = useMemo(() => wallets.find((wallet) => wallet.connectorId === ConnectorIds.klip), [wallets])

  return klip
}
