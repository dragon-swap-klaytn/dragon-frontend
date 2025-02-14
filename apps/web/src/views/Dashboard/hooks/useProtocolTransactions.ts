import { useQuery } from '@tanstack/react-query'
import { DashboardPoolType } from 'pages/dashboard'
import fetchV2TopTransactions from 'views/Dashboard/data/v2/protocol/transactions'
import fetchV3TopTransactions from 'views/Dashboard/data/v3/protocol/transactions'
import { QUERY_SETTINGS_IMMUTABLE, QUERY_SETTINGS_INTERVAL_REFETCH } from 'views/Dashboard/hooks/consts'

export default function useProtocolTransactions(poolType: DashboardPoolType = 'v3') {
  const { data: v3Transactions } = useQuery(['dashboard/v3/protocol/transactions'], () => fetchV3TopTransactions(), {
    ...QUERY_SETTINGS_IMMUTABLE,
    ...QUERY_SETTINGS_INTERVAL_REFETCH, // update latest Transactions per 15s
    enabled: Boolean(poolType === 'v3'),
  })

  const { data: v2Transactions } = useQuery(['dashboard/v2/protocol/transactions'], () => fetchV2TopTransactions(), {
    ...QUERY_SETTINGS_IMMUTABLE,
    ...QUERY_SETTINGS_INTERVAL_REFETCH, // update latest Transactions per 15s
    enabled: Boolean(poolType === 'v2'),
  })

  return poolType === 'v3' ? v3Transactions : v2Transactions
}
