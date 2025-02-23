import { useQuery } from '@tanstack/react-query'
import { PoolType } from 'types'
import { fetchV2GlobalChartData } from 'views/Dashboard/data/v2/protocol/chart'
import { fetchV3GlobalChartData } from 'views/Dashboard/data/v3/protocol/chart'

import { QUERY_SETTINGS_IMMUTABLE, QUERY_SETTINGS_WITHOUT_INTERVAL_REFETCH } from 'views/Dashboard/hooks/consts'
import { ChartDayData, V2TokenChartEntry } from 'views/Dashboard/types'

export default function useProtocolChartData(poolType: PoolType = 'v3') {
  const { data: v3 } = useQuery<{
    data?: ChartDayData[] | V2TokenChartEntry[]
    error: boolean
  }>([`dashboard/v3/protocol/protocolChartData`], () => fetchV3GlobalChartData(), {
    ...QUERY_SETTINGS_IMMUTABLE,
    ...QUERY_SETTINGS_WITHOUT_INTERVAL_REFETCH,
  })

  const { data: v2 } = useQuery<{
    data?: ChartDayData[] | V2TokenChartEntry[]
    error: boolean
  }>([`dashboard/v2/protocol/protocolChartData`], () => fetchV2GlobalChartData(), {
    ...QUERY_SETTINGS_IMMUTABLE,
    ...QUERY_SETTINGS_WITHOUT_INTERVAL_REFETCH,
  })

  return poolType === 'v3' ? v3?.data : v2?.data
}
