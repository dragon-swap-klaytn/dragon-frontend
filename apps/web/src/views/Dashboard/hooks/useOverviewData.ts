import { PancakeDayDataV2, PancakeDayDataV3, TransactionEvent } from 'lib/graph-queries/types'
import useSWR from 'swr'
import { PoolType } from 'types'

async function fetcher<T extends PoolType>(
  type: T,
): Promise<{
  chartData: T extends 'v2' ? PancakeDayDataV2[] : PancakeDayDataV3[]
  transactions: OverviewTransaction
}> {
  const res = await fetch(`/api/stats/overview/${type}`)
  return res.json()
}

export type OverviewTransaction = {
  mints: TransactionEvent[]
  burns: TransactionEvent[]
  swaps: TransactionEvent[]
}

export default function useOverviewData<T extends PoolType>(poolType: T) {
  const { data, error, isLoading } = useSWR(
    poolType ? `dashboard/stats/overview/${poolType}` : null,
    () => fetcher(poolType),
    { revalidateOnFocus: false },
  )

  return {
    chartData: data?.chartData,
    transactions: data?.transactions,
    error,
    isLoading,
  }
}
