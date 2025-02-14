import { useQuery } from '@tanstack/react-query'
import { DashboardPoolType } from 'pages/dashboard'
import fetchV2TokenTransactions from 'views/Dashboard/data/v2/token/transactions'
import { fetchTokenTransactions as fetchV3TokenTransactions } from 'views/Dashboard/data/v3/token/transactions'
import { QUERY_SETTINGS_IMMUTABLE, QUERY_SETTINGS_INTERVAL_REFETCH } from 'views/Dashboard/hooks/consts'

export default function useTokenTransactions(address: string, poolType: DashboardPoolType = 'v3') {
  const { data: v3 } = useQuery(
    [`dashboard/v3/token/transactionsData/${address}`],
    () => fetchV3TokenTransactions(address),
    {
      ...QUERY_SETTINGS_IMMUTABLE,
      ...QUERY_SETTINGS_INTERVAL_REFETCH,
      enabled: Boolean(address && poolType === 'v3'),
    },
  )
  const { data: v2 } = useQuery(
    [`dashboard/v2/token/transactionsData/${address}`],
    () => fetchV2TokenTransactions(address),
    {
      ...QUERY_SETTINGS_IMMUTABLE,
      ...QUERY_SETTINGS_INTERVAL_REFETCH,
      enabled: Boolean(address && poolType === 'v2'),
    },
  )
  return poolType === 'v3' ? v3?.data : v2?.data
}
