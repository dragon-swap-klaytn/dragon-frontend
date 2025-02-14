import { useQuery } from '@tanstack/react-query'
import { DashboardPoolType } from 'pages/dashboard'
import { getDeltaTimestamps } from 'utils/getDeltaTimestamps'
import { fetchProtocolData as fetchProtocolV2Data } from 'views/Dashboard/data/v2/protocol/overview'

import { fetchProtocolData as fetchProtocolV3Data } from 'views/Dashboard/data/v3/protocol/overview'
import { QUERY_SETTINGS_IMMUTABLE, QUERY_SETTINGS_WITHOUT_INTERVAL_REFETCH } from 'views/Dashboard/hooks/consts'
import { useBlockFromTimeStampQuery } from 'views/Dashboard/hooks/useBlocksFromTimestamps'

export default function useProtocolData(poolType: DashboardPoolType = 'v3') {
  const [t24, t48] = getDeltaTimestamps()
  const { blocks } = useBlockFromTimeStampQuery([t24, t48])
  const [block24, block48] = blocks ?? []

  const { data: v3 } = useQuery([`dashboard/v3/protocol/protocolData`], () => fetchProtocolV3Data([block24, block48]), {
    ...QUERY_SETTINGS_IMMUTABLE,
    ...QUERY_SETTINGS_WITHOUT_INTERVAL_REFETCH,
    enabled: Boolean(block24 && block48 && poolType === 'v3'),
  })

  const { data: v2 } = useQuery([`dashboard/v2/protocol/protocolData`], () => fetchProtocolV2Data(block24, block48), {
    ...QUERY_SETTINGS_IMMUTABLE,
    ...QUERY_SETTINGS_WITHOUT_INTERVAL_REFETCH,
    enabled: Boolean(block24 && block48 && poolType === 'v2'),
  })

  return poolType === 'v3' ? v3?.data : v2?.data
}
