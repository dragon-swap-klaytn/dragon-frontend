import { createWallets } from 'config/wallet'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { useMemo } from 'react'
import { useConnect } from 'wagmi'

export default function useWallets() {
  const { chainId } = useActiveChainId()
  const { connectAsync } = useConnect()
  const wallets = useMemo(() => (chainId ? createWallets(chainId, connectAsync) : []), [chainId, connectAsync])

  return wallets
}
