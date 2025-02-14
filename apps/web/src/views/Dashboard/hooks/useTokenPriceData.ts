import { useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { QUERY_SETTINGS_IMMUTABLE, QUERY_SETTINGS_INTERVAL_REFETCH } from 'views/Dashboard/hooks/consts'

import duration from 'dayjs/plugin/duration'
import { DashboardPoolType } from 'pages/dashboard'
import fetchV2TokenPriceData from 'views/Dashboard/data/v2/token/priceData'
import { fetchTokenPriceData as fetchV3TokenPriceData } from 'views/Dashboard/data/v3/token/priceData'

dayjs.extend(duration)

export default function useTokenPriceData({
  address,
  interval,
  timeWindow,
  poolType,
}: {
  address: string
  interval: number
  timeWindow: duration.Duration
  poolType: DashboardPoolType
}) {
  const startTimestamp = dayjs().subtract(timeWindow).startOf('hours').unix()
  const { data: v3 } = useQuery(
    [`dashboard/v3/token/priceData/${address}`],
    () => fetchV3TokenPriceData(address, interval, startTimestamp),
    {
      ...QUERY_SETTINGS_IMMUTABLE,
      ...QUERY_SETTINGS_INTERVAL_REFETCH,
      enabled: Boolean(address && poolType === 'v3'),
    },
  )
  const { data: v2 } = useQuery(
    [`dashboard/v2/token/priceData/${address}`],
    () => fetchV2TokenPriceData(address, interval, startTimestamp),
    {
      ...QUERY_SETTINGS_IMMUTABLE,
      ...QUERY_SETTINGS_INTERVAL_REFETCH,
      enabled: Boolean(address && poolType === 'v2'),
    },
  )
  return poolType === 'v3' ? v3?.data : v2?.data
}
