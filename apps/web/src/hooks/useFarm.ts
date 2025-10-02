import { ComputedFarmConfigV3, createFarmFetcherV3, fetchTokenUSDValues } from '@pancakeswap/farms'
import { farmsV3ConfigChainMap } from '@pancakeswap/farms/constants/v3'
import { Currency } from '@pancakeswap/sdk'
import { FeeAmount, Pool } from '@pancakeswap/v3-sdk'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import { FAST_INTERVAL } from 'config/constants'
import { getViemClients } from 'utils/viem'

const farmFetcherV3 = createFarmFetcherV3(getViemClients)

interface FarmParams {
  currencyA?: Currency | null
  currencyB?: Currency | null
  feeAmount?: FeeAmount
}

export function useFarm({ currencyA, currencyB, feeAmount }: FarmParams) {
  const chainId = currencyA?.chainId
  const farmConfig = useMemo(() => {
    if (!chainId || !currencyA || !currencyB || !feeAmount) {
      return null
    }
    const farms: ComputedFarmConfigV3[] = farmsV3ConfigChainMap[chainId]
    if (!farms) {
      return null
    }
    const lpAddress = Pool.getAddress(currencyA.wrapped, currencyB.wrapped, feeAmount)
    const farm = farms.find((f) => f.lpAddress === lpAddress)
    return farm ?? null
  }, [chainId, currencyA, currencyB, feeAmount])

  return useQuery(
    [
      chainId,
      farmConfig?.token0.address,
      farmConfig?.token0.symbol,
      farmConfig?.token1.address,
      farmConfig?.token1.symbol,
      farmConfig?.feeAmount,
    ],
    async () => {
      if (!farmConfig || !chainId) {
        throw new Error('Invalid farm config')
      }

      const currencies = [farmConfig.token0, farmConfig.token1]
      const commonPrice = await fetchTokenUSDValues(currencies)

      try {
        const data = await farmFetcherV3.fetchFarms({
          chainId,
          farms: [farmConfig],
          commonPrice,
        })

        const { farmsWithPrice, cakePerSecond, poolLength } = data
        const farm = farmsWithPrice[0]
        return {
          farm,
          poolLength,
          cakePerSecond,
        }
      } catch (error) {
        console.error(error)
        // return fallback for now since not all chains supported
        return null
      }
    },
    {
      enabled: Boolean(chainId && farmConfig),
      refetchInterval: FAST_INTERVAL * 2,
      staleTime: FAST_INTERVAL * 2,
    },
  )
}
