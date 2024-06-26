import { FAST_INTERVAL, SLOW_INTERVAL } from 'config/constants'
// eslint-disable-next-line camelcase
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { Block } from 'state/info/types'
import { getDeltaTimestamps } from 'utils/getDeltaTimestamps'
import { viemClients } from 'utils/viem'
import { useBlockNumber, usePublicClient } from 'wagmi'

const REFRESH_BLOCK_INTERVAL = 6000

export const usePollBlockNumber = () => {
  const queryClient = useQueryClient()
  const { chainId } = useActiveChainId()
  const { data: blockNumber } = useBlockNumber({
    chainId,
    cacheTime: 10_000,
    onBlock: (data) => {
      queryClient.setQueryData(['blockNumber', chainId], Number(data))
    },
    onSuccess: (data) => {
      if (!queryClient.getQueryCache().find<number>(['initialBlockNumber', chainId])?.state?.data) {
        queryClient.setQueryData(['initialBlockNumber', chainId], Number(data))
      }
      if (!queryClient.getQueryCache().find<number>(['initialBlockTimestamp', chainId])?.state?.data) {
        const fetchInitialBlockTimestamp = async () => {
          const provider = viemClients[chainId as keyof typeof viemClients]
          if (provider) {
            const block = await provider.getBlock({ blockNumber: data })
            queryClient.setQueryData(['initialBlockTimestamp', chainId], Number(block.timestamp))
          }
        }
        fetchInitialBlockTimestamp()
      }
    },
  })

  useQuery(
    ['blockNumberFetcher', chainId],
    async () => {
      queryClient.setQueryData(['blockNumber', chainId], Number(blockNumber))
      return null
    },
    {
      enabled: false,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  )

  useQuery([FAST_INTERVAL, 'blockNumber', chainId], async () => Number(blockNumber), {
    enabled: Boolean(chainId),
    refetchInterval: FAST_INTERVAL,
  })

  useQuery([SLOW_INTERVAL, 'blockNumber', chainId], async () => Number(blockNumber), {
    enabled: Boolean(chainId),
    refetchInterval: SLOW_INTERVAL,
  })
}

export const useCurrentBlock = (): number => {
  const { chainId } = useActiveChainId()
  const { data: currentBlock = 0 } = useQuery<number>(['blockNumber', chainId], {
    enabled: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  })
  return Number(currentBlock)
}

export const useChainCurrentBlock = (chainId: number): number => {
  const { chainId: activeChainId } = useActiveChainId()
  const provider = usePublicClient({ chainId })

  const { data: currentBlock = 0 } = useQuery(
    activeChainId === chainId ? ['blockNumber', chainId] : ['chainBlockNumber', chainId],
    async () => {
      const blockNumber = await provider.getBlockNumber()
      return Number(blockNumber)
    },
    {
      enabled: activeChainId !== chainId,
      ...(activeChainId !== chainId && { refetchInterval: REFRESH_BLOCK_INTERVAL }),
    },
  )
  return currentBlock
}

export const useInitialBlock = (): number => {
  const { chainId } = useActiveChainId()
  const { data: initialBlock = 0 } = useQuery<number>(['initialBlockNumber', chainId], {
    enabled: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  })
  return Number(initialBlock)
}

export const useInitialBlockTimestamp = (): number => {
  const { chainId } = useActiveChainId()
  const { data: initialBlockTimestamp = 0 } = useQuery<number>(['initialBlockTimestamp', chainId], {
    enabled: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  })
  return Number(initialBlockTimestamp)
}

const secondPerUnits = () => {
  const dayUnit = 60 * 60 * 60
  return [dayUnit, dayUnit * 2, dayUnit * 7, dayUnit * 14]
}

export const useBeforeBlockPerDayUnits = (): Block[] => {
  const { chainId } = useActiveChainId()
  const { data: blockNumber } = useBlockNumber({ chainId })
  const [d24hPer, d48hPer, d7dPer, d14dPer] = secondPerUnits()

  const [t24h, t48h, t7d, t14d] = getDeltaTimestamps()

  return blockNumber
    ? [
        { number: Number(blockNumber - BigInt(d24hPer)), timestamp: String(t24h) },
        { number: Number(blockNumber - BigInt(d48hPer)), timestamp: String(t48h) },
        { number: Number(blockNumber - BigInt(d7dPer)), timestamp: String(t7d) },
        { number: Number(blockNumber - BigInt(d14dPer)), timestamp: String(t14d) },
      ]
    : []
}
