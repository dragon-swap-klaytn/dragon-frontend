import { WalletIds } from '@pancakeswap/uikit'
import { createWallets } from 'config/wallet'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { useMemo } from 'react'
import { useConnect } from 'wagmi'

export default function useWallets() {
  const { chainId } = useActiveChainId()
  const { connectAsync, connectors } = useConnect()
  const wallets = useMemo(() => (chainId ? createWallets(chainId, connectAsync) : []), [chainId, connectAsync])

  const filteredWallets = useMemo(
    () =>
      wallets.filter((wallet) => {
        if (wallet.id === WalletIds.dappPortalWallet) {
          const connector = connectors.find((c) => c.id === wallet.connectorId)
          if (!connector || !('isSupportedBrowser' in connector) || !connector.isSupportedBrowser) return false

          return true
        }

        return true
      }),
    [wallets, connectors],
  )

  return filteredWallets
}
