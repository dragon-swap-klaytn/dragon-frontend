import { PancakeDayDataV2, PancakeDayDataV3, TransactionEvent } from 'lib/graph-queries/types'
import { ProtocolV2Data, ProtocolV3Data } from 'protocol-data/get-cached-protocol-data'
import useSWR from 'swr'
import { PoolType } from 'types'

async function fetcher<T extends PoolType>(
  type: T,
): Promise<{
  protocolData: T extends 'v2' ? ProtocolV2Data : ProtocolV3Data
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
    protocolData: data?.protocolData,
    chartData: data?.chartData,
    transactions: data?.transactions,
    error,
    isLoading,
  }
}
