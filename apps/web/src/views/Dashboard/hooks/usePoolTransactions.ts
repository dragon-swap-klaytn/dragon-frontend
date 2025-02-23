import { useQuery } from '@tanstack/react-query'
import { PoolType } from 'types'
import { isAddress } from 'viem'
import fetchV2PoolTransactions from 'views/Dashboard/data/v2/pool/transactions'
import { fetchV3PoolTransactions } from 'views/Dashboard/data/v3/pool/transactions'
import { QUERY_SETTINGS_IMMUTABLE, QUERY_SETTINGS_WITHOUT_INTERVAL_REFETCH } from 'views/Dashboard/hooks/consts'

export default function usePoolTransactions(address: string, poolType: PoolType = 'v3') {
  const { data: v3 } = useQuery(
    [`dashboard/v3/pool/transactionsData/${address}`],
    () => fetchV3PoolTransactions(address),
    {
      ...QUERY_SETTINGS_IMMUTABLE,
      ...QUERY_SETTINGS_WITHOUT_INTERVAL_REFETCH,
      enabled: isAddress(address),
    },
  )

  const { data: v2 } = useQuery(
    [`dashboard/v2/pool/transactionsData/${address}`],
    () => fetchV2PoolTransactions(address),
    {
      ...QUERY_SETTINGS_IMMUTABLE,
      ...QUERY_SETTINGS_WITHOUT_INTERVAL_REFETCH,
      enabled: isAddress(address),
    },
  )

  return poolType === 'v3' ? v3?.data : v2?.data
}
