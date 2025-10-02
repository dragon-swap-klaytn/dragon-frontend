import { useQuery, useQueryClient } from '@tanstack/react-query'
import { MEDIUM_INTERVAL } from 'config/constants'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { useFeeData } from 'wagmi'

const GAS_KEYS = {
  gasPrice: 'gasPrice',
  maxFeePerGas: 'maxFeePerGas',
  maxPriorityFeePerGas: 'maxPriorityFeePerGas',
} as const

export const usePollFeeData = () => {
  const queryClient = useQueryClient()
  const { chainId } = useActiveChainId()
  const { refetch } = useFeeData({
    chainId,
    watch: false,
    staleTime: Infinity,
    cacheTime: MEDIUM_INTERVAL,
  })

  useQuery(
    ['feeData', chainId],
    async () => {
      const feeData = await refetch()
      const data = feeData?.data

      queryClient.setQueryData([GAS_KEYS.gasPrice, chainId], data?.gasPrice)
      queryClient.setQueryData([GAS_KEYS.maxFeePerGas, chainId], data?.maxFeePerGas)
      queryClient.setQueryData([GAS_KEYS.maxPriorityFeePerGas, chainId], data?.maxPriorityFeePerGas)

      return data
    },
    {
      enabled: Boolean(chainId),
      refetchInterval: MEDIUM_INTERVAL,
    },
  )
}

const createCurrentValueHook = (key: keyof typeof GAS_KEYS) => (): bigint | undefined => {
  const { chainId } = useActiveChainId()
  const { data } = useQuery<bigint | undefined>([key, chainId], {
    enabled: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  })
  return data
}

export const useCurrentGasPrice = createCurrentValueHook('gasPrice')
export const useCurrentMaxFeePerGas = createCurrentValueHook('maxFeePerGas')
export const useCurrentMaxPriorityFeePerGas = createCurrentValueHook('maxPriorityFeePerGas')
