import { ChainId } from '@pancakeswap/chains'
import dayjs from 'dayjs'
import { useMemo } from 'react'
import { DURATION_INTERVAL } from 'views/Dashboard/constants'
import { fetchPairPriceChartTokenData } from 'views/Dashboard/data/v3/token/priceData'
import { QUERY_SETTINGS_IMMUTABLE } from 'views/Dashboard/hooks/consts'
import { useQuery } from 'wagmi'

// this is for the swap page and ROI calculator
export default function usePairPriceChartTokenData(
  address?: string,
  duration?: 'day' | 'week' | 'month' | 'year',
  targetChainId?: ChainId,
) {
  const { data } = useQuery(
    [`v3/info/token/pairPriceChartToken/${address}/${duration}`, targetChainId],
    async () => {
      if (!address)
        return {
          data: [],
          maxPrice: 0,
          minPrice: 0,
          averagePrice: 0,
        }

      const utcCurrentTime = dayjs()
      const startTimestamp = utcCurrentTime
        .subtract(1, duration ?? 'day')
        .startOf('hour')
        .unix()

      return fetchPairPriceChartTokenData(address, DURATION_INTERVAL[duration ?? 'day'], startTimestamp)
    },
    {
      enabled: Boolean(address && address !== 'undefined'),
      ...QUERY_SETTINGS_IMMUTABLE,
    },
  )
  return useMemo(
    () => ({
      data: data?.data ?? [],
      maxPrice: data?.maxPrice,
      minPrice: data?.minPrice,
      averagePrice: data?.averagePrice,
    }),
    [data],
  )
}
