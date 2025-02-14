import { isAddress } from 'viem'

import { useQuery } from '@tanstack/react-query'
import { fetchPoolChartData } from 'views/Dashboard/data/v3/pool/chartData'
import { QUERY_SETTINGS_IMMUTABLE, QUERY_SETTINGS_WITHOUT_INTERVAL_REFETCH } from 'views/Dashboard/hooks/consts'

export default function usePoolChartData(address: string) {
  const { data } = useQuery([`dashboard/pool/chartData/${address}/swap`], () => fetchPoolChartData(address), {
    ...QUERY_SETTINGS_IMMUTABLE,
    ...QUERY_SETTINGS_WITHOUT_INTERVAL_REFETCH,
    enabled: isAddress(address),
  })

  return data?.data ?? undefined
}
