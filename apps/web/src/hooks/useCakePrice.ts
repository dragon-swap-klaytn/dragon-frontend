import { ChainId } from '@pancakeswap/chains'
import { ZERO_ADDRESS } from '@pancakeswap/uikit'
import { BIG_ZERO } from '@pancakeswap/utils/bigNumber'
import { fetchCurrencyPriceMap } from '@pancakeswap/utils/getCurrencyPrice'
import { useQuery } from '@tanstack/react-query'
import BigNumber from 'bignumber.js'
import { oraklNetworkOracleABI } from 'config/abi/oraklNetworkOracle'
import { SLOW_INTERVAL } from 'config/constants'
import { publicClient } from 'utils/wagmi'
import { formatUnits } from 'viem'

// for migration to bignumber.js to avoid breaking changes
export const useCakePrice = ({ enabled = true } = {}) => {
  const { data } = useQuery<BigNumber, Error>({
    queryKey: ['cakePrice'],
    queryFn: async () => new BigNumber(await getCakePriceFromOracle()),
    staleTime: SLOW_INTERVAL,
    refetchInterval: SLOW_INTERVAL,
    enabled,
  })
  return data ?? BIG_ZERO
}

export const getCakePriceFromOracle = async () => {
  const [data, priceMap] = await Promise.all([
    publicClient({ chainId: ChainId.KLAYTN }).readContract({
      abi: oraklNetworkOracleABI,
      address: '0x612e5B796c07940Ada4Bfb6603dEf23178765200',
      functionName: 'latestRoundData',
      args: [],
    }),

    fetchCurrencyPriceMap(),
  ])

  // @ts-ignore
  return +(priceMap[ZERO_ADDRESS] || formatUnits(data[1] as bigint, 8))
}
