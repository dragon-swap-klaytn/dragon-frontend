import { ChainId } from '@pancakeswap/chains'
import { BIG_ZERO } from '@pancakeswap/utils/bigNumber'
import { chainlinkOracleKLAY } from '@pancakeswap/prediction'
import BigNumber from 'bignumber.js'
import { oraklNetworkOracleABI } from 'config/abi/oraklNetworkOracle'
import { publicClient } from 'utils/wagmi'
import { formatUnits } from 'viem'
import { SLOW_INTERVAL } from 'config/constants'
import { useQuery } from '@tanstack/react-query'

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
  const data = await publicClient({ chainId: ChainId.KLAYTN }).readContract({
    abi: oraklNetworkOracleABI,
    address: chainlinkOracleKLAY[ChainId.KLAYTN],
    functionName: 'latestRoundData',
    args: ['KLAY-USDT']
  })

  // @ts-ignore
  return formatUnits(data[1] as bigint, 8)
}
