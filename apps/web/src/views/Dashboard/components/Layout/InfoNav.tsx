import { SegmentedControl } from '@pancakeswap/uikit'

import { useAtom } from 'jotai'
import { dashboardTabAtom } from 'pages/dashboard'
import { useCallback } from 'react'

export const V3DASHBOARD_TABS = ['Overview', 'Pairs', 'Tokens'] as const
export type V3DashboardTabType = (typeof V3DASHBOARD_TABS)[number]

const InfoNav: React.FC = () => {
  const [tab, setTab] = useAtom(dashboardTabAtom)

  const handleTabChange = useCallback((newTab: V3DashboardTabType) => setTab(newTab), [setTab])

  return (
    <SegmentedControl
      options={V3DASHBOARD_TABS as unknown as V3DashboardTabType[]}
      value={tab}
      onChange={handleTabChange}
      paddingX="px-8"
      className="mx-auto"
      useTranslationOption
    />
  )
}

export default InfoNav
