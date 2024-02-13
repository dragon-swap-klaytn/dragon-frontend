import { ChainId } from '@pancakeswap/chains'
import { getDefaultGasLimit, getGasLimitOnChain } from '@pancakeswap/multicall'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import { getViemClients } from 'utils/viem'

const CHAINS_TO_USE_DEFAULT = [ChainId.KLAYTN_TESTNET, ChainId.KLAYTN]

export function useMulticallGasLimit(chainId?: ChainId) {
  const shouldUseDefault = useMemo(() => Boolean(chainId && CHAINS_TO_USE_DEFAULT.includes(chainId)), [chainId])
  const defaultGasLimit = useMemo(() => getDefaultGasLimit(chainId), [chainId])
  const client = useMemo(() => getViemClients({ chainId }), [chainId])

  const { data: gasLimitOnChain } = useQuery({
    queryKey: [chainId],
    queryFn: async () => {
      return chainId === ChainId.KLAYTN ? defaultGasLimit : getGasLimitOnChain({ chainId, client })
    },
    enabled: Boolean(chainId && client && !shouldUseDefault),
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchInterval: 30_000,
    refetchOnWindowFocus: false,
  })
  // console.log('gasLimit gas data confirm?', { gasLimitOnChain })

  return useMemo(
    () => (shouldUseDefault ? defaultGasLimit : gasLimitOnChain),
    [gasLimitOnChain, shouldUseDefault, defaultGasLimit],
  )
}
