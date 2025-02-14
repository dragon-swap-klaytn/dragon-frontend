import { getV2PoolDayData } from 'lib/graph-queries/get-v2-pool-day-data'
import { getV3PoolDayData } from 'lib/graph-queries/get-v3-pool-day-data'
import useSWR from 'swr'

type UsePoolChartDataParams = {
  type: 'v2' | 'v3'
  address: string
}

type UsePoolChartDataOptions = {
  length?: number
}

export default function usePoolChartData(
  { type, address }: UsePoolChartDataParams,
  { length = 60 }: UsePoolChartDataOptions = {},
) {
  const { data, error } = useSWR(
    type && address ? `pools/${type}/${address}` : null,
    () => {
      if (type === 'v2') {
        return getV2PoolDayData(address, { length })
      }

      if (type === 'v3') {
        return getV3PoolDayData(address, { length })
      }

      throw new Error('Invalid pool type')
    },
    {
      revalidateOnFocus: false,
    },
  )

  return {
    chartData: data,
    error,
  }
}
