import { useQuery } from '@tanstack/react-query'
import BigNumber from 'bignumber.js'
import { getAprsForStableFarm } from 'utils/getAprsForStableFarm'

const refreshIntervalForInfo = 15000 // 15s

export const useStableSwapAPR = (address: string | undefined): number | undefined => {
  const { data } = useQuery<BigNumber>([`info/pool/stableAPR/${address}/`], () => getAprsForStableFarm(address), {
    enabled: Boolean(address),
    refetchInterval: refreshIntervalForInfo,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    retry: 3,
    retryDelay: 3000,
  })
  return data?.toNumber()
}
