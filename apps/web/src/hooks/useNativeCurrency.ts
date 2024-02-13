import { Native, NativeCurrency } from '@pancakeswap/sdk'
import { DEFAULT_CHAIN_ID } from '@pancakeswap/chains'
import { useMemo } from 'react'
import { useActiveChainId } from './useActiveChainId'

export default function useNativeCurrency(): NativeCurrency {
  const { chainId } = useActiveChainId()
  return useMemo(() => {
    try {
      return Native.onChain(chainId)
    } catch (e) {
      return Native.onChain(DEFAULT_CHAIN_ID)
    }
  }, [chainId])
}
