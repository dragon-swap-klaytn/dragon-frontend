import { PancakeDayDataV2, PancakeDayDataV3, TransactionEvent } from 'lib/graph-queries/types'
import { DashboardPoolType } from 'pages/dashboard'
import { useMemo } from 'react'

import useSWR from 'swr'

export type OverviewTransaction = {
  mints: TransactionEvent[]
  burns: TransactionEvent[]
  swaps: TransactionEvent[]
}

export default function useOverviewData(poolType: DashboardPoolType) {
  const { data: v3Overview, error: v3OverviewError } = useSWR(
    poolType === 'v3' ? 'dashboard/stats/overview/v3' : null,
    async () => {
      const res = await fetch('/api/stats/overview/v3')
      const parsed = (await res.json()) as {
        chartData: PancakeDayDataV3[]
        transactions: OverviewTransaction
      }

      return parsed
    },
    {
      refreshInterval: 1_000 * 60,
    },
  )

  const { data: v2Overview, error: v2OverviewError } = useSWR(
    poolType === 'v2' ? 'dashboard/stats/overview/v2' : null,
    async () => {
      const res = await fetch('/api/stats/overview/v2')
      const parsed = (await res.json()) as {
        chartData: PancakeDayDataV2[]
        transactions: OverviewTransaction
      }

      return parsed
    },
    {
      refreshInterval: 1_000 * 60,
    },
  )

  return useMemo(
    () => ({
      chartData: poolType === 'v3' ? v3Overview?.chartData : v2Overview?.chartData,
      transactions: poolType === 'v3' ? v3Overview?.transactions : v2Overview?.transactions,
      overviewLoading: poolType === 'v3' ? !v3Overview && !v3OverviewError : !v2Overview && !v2OverviewError,
    }),
    [poolType, v3Overview, v2Overview, v3OverviewError, v2OverviewError],
  )
}
