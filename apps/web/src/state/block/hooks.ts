import { FAST_INTERVAL, SLOW_INTERVAL } from 'config/constants'
// eslint-disable-next-line camelcase
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { getDeltaTimestamps } from 'utils/getDeltaTimestamps'
import { Block } from 'views/Dashboard/types'
import { useBlockNumber, usePublicClient } from 'wagmi'

const REFRESH_BLOCK_INTERVAL = 6000

const fetchBlockNumber = async () =>
  fetch('/api/blocknumber')
    .then((res) => res.json())
    .then((data) => Number(data.blockNumber))

export const usePollBlockNumber = () => {
  const queryClient = useQueryClient()
  const { chainId } = useActiveChainId()

  // Poll the block number with a fast interval
  useQuery(
    ['blockNumber', chainId],
    async () => {
      const blockNumber = await fetchBlockNumber()
      // Update our cache with the new block number
      queryClient.setQueryData(['blockNumber', chainId], blockNumber)
      // Set the initial block number if it isn’t set yet
      if (!queryClient.getQueryCache().find<number>(['initialBlockNumber', chainId])?.state?.data) {
        queryClient.setQueryData(['initialBlockNumber', chainId], blockNumber)
      }
      // (Optionally) set the initial block timestamp if needed here...
      return blockNumber
    },
    {
      enabled: Boolean(chainId),
      refetchInterval: FAST_INTERVAL,
    },
  )

  // Optionally, poll with a slow interval as well
  useQuery(
    [SLOW_INTERVAL, 'blockNumber', chainId],
    async () => {
      const blockNumber = await fetchBlockNumber()
      return blockNumber
    },
    {
      enabled: Boolean(chainId),
      refetchInterval: SLOW_INTERVAL,
    },
  )
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
      const blockNumber = await fetch('/api/blocknumber')
        .then((res) => res.json())
        .then((data) => data.blockNumber)
        .catch(() => provider.getBlockNumber())

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
