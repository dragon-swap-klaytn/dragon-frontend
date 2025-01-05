import { ChainId } from '@pancakeswap/chains'
import { useQuery } from '@tanstack/react-query'
import BigNumber from 'bignumber.js'
import { bCakeFarmBoosterABI } from 'config/abi/bCakeFarmBooster'
import { useMemo } from 'react'
import { getBCakeFarmBoosterAddress } from 'utils/addressHelpers'
import { publicClient } from 'utils/wagmi'

const useFarmBoosterConstants = () => {
  const bCakeFarmBoosterAddress = getBCakeFarmBoosterAddress()

  const { data, status } = useQuery(
    ['farmBoosterConstants'],
    async () => {
      return publicClient({ chainId: ChainId.KLAYTN }).multicall({
        contracts: [
          {
            address: bCakeFarmBoosterAddress,
            abi: bCakeFarmBoosterABI,
            functionName: 'cA',
          },
          {
            address: bCakeFarmBoosterAddress,
            abi: bCakeFarmBoosterABI,
            functionName: 'CA_PRECISION',
          },
          {
            address: bCakeFarmBoosterAddress,
            abi: bCakeFarmBoosterABI,
            functionName: 'cB',
          },
        ],
        allowFailure: false,
      })
    },
    {
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
    },
  )
  return useMemo(() => {
    return {
      constants: data && {
        cA: new BigNumber(data[0].toString()).div(new BigNumber(data[1].toString())).toNumber(),
        cB: new BigNumber(data[2].toString()).toNumber(),
      },
      isLoading: status !== 'success',
    }
  }, [data, status])
}

export default useFarmBoosterConstants
