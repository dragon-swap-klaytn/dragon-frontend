import { useMemo } from 'react'
import { Token } from '@pancakeswap/swap-sdk-core'
import { useGetChainName } from 'state/info/hooks'

export function useTokenLogo(token: Token | undefined | null) {
  const chainName = useGetChainName()

  return useMemo(() => {
    return !token?.address ? undefined : `https://dgswap.io/images/tokens/${chainName?.toLowerCase()}/${token?.address}.png`
  }, [chainName, token])
}