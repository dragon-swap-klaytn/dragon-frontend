import { useQuery } from '@tanstack/react-query'
import { DashboardPoolType } from 'pages/dashboard'
import fetchV2TokenChartData from 'views/Dashboard/data/v2/token/chartData'
import { fetchTokenChartData as fetchV3TokenChartData } from 'views/Dashboard/data/v3/token/chartData'
import { QUERY_SETTINGS_IMMUTABLE, QUERY_SETTINGS_INTERVAL_REFETCH } from 'views/Dashboard/hooks/consts'

export default function useTokenChartData(address: string, poolType: DashboardPoolType = 'v3') {
  const { data: v3 } = useQuery([`dashboard/v3/token/chartData/${address}`], () => fetchV3TokenChartData(address), {
    ...QUERY_SETTINGS_IMMUTABLE,
    ...QUERY_SETTINGS_INTERVAL_REFETCH,
    enabled: Boolean(address && poolType === 'v3'),
  })

  const { data: v2 } = useQuery([`dashboard/v2/token/chartData/${address}`], () => fetchV2TokenChartData(address), {
    ...QUERY_SETTINGS_IMMUTABLE,
    ...QUERY_SETTINGS_INTERVAL_REFETCH,
    enabled: Boolean(address && poolType === 'v2'),
  })

  return poolType === 'v3' ? v3?.data : v2?.data
}
