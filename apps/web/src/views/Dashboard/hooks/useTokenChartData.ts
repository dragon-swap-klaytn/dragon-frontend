import { getV2TokenDayData } from 'lib/graph-queries/get-v2-token-day-data'
import { getV3TokenDayData } from 'lib/graph-queries/get-v3-token-day-data'
import { TokenDayDataV2, TokenDayDataV3 } from 'lib/graph-queries/types'
import useSWR from 'swr'
import { PoolType } from 'types'

async function fetcher<T extends PoolType>(
  type: T,
  address: string,
  length?: number,
): Promise<T extends 'v2' ? TokenDayDataV2[] : TokenDayDataV3[]> {
  if (type === 'v2') {
    // we assert the return type to satisfy the conditional
    return getV2TokenDayData(address, { length }) as Promise<T extends 'v2' ? TokenDayDataV2[] : TokenDayDataV3[]>
  }
  if (type === 'v3') {
    return getV3TokenDayData(address, { length }) as Promise<T extends 'v2' ? TokenDayDataV2[] : TokenDayDataV3[]>
  }
  throw new Error('Invalid token type')
}

type UseTokenChartDataParams<T extends PoolType> = {
  type: T
  address: string
}

type UseTokenChartDataOptions = {
  length?: number
}

export default function useTokenChartData<T extends PoolType>(
  { type, address }: UseTokenChartDataParams<T>,
  { length = 60 }: UseTokenChartDataOptions = {},
) {
  const { data, error } = useSWR(
    type && address ? `tokens/${type}/${address}` : null,
    () => fetcher(type, address, length),
    {
      revalidateOnFocus: false,
    },
  )

  return {
    chartData: data,
    error,
  }
}
