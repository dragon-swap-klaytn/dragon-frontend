import { useTranslation } from '@pancakeswap/localization'
import { SegmentedControl } from '@pancakeswap/uikit'
import Page from 'components/Layout/Page'
import { atom, useAtom } from 'jotai'
import { useCallback, useState } from 'react'
import Overview from 'views/Dashboard/OverView'
import Pools from 'views/Dashboard/Pools'
import Tokens from 'views/Dashboard/Tokens'

export const DASHBOARD_TABS = ['Overview', 'Pairs', 'Tokens'] as const
export type DashboardTabType = (typeof DASHBOARD_TABS)[number]

export const DASHBOARD_POOL_TYPES = ['v3', 'v2'] as const
export type DashboardPoolType = (typeof DASHBOARD_POOL_TYPES)[number]

export const dashboardTabAtom = atom<DashboardTabType>('Overview')

const InfoPage = () => {
  const { t } = useTranslation()
  const [tab, setTab] = useAtom(dashboardTabAtom)
  const [poolType, setPoolType] = useState<DashboardPoolType>('v3')

  const handleTabChange = useCallback((newTab: DashboardTabType) => setTab(newTab), [setTab])
  const handlePoolTabChange = useCallback((newTab: DashboardPoolType) => setPoolType(newTab), [setPoolType])

  return (
    <Page className="w-full flex flex-col items-center space-y-8 sm">
      <SegmentedControl
        options={DASHBOARD_TABS as unknown as DashboardTabType[]}
        value={tab}
        onChange={handleTabChange}
        paddingX="px-4 md:px-8"
        className="mx-auto"
        useTranslationOption
      />

      <div className="flex flex-wrap items-center w-full justify-between gap-2">
        <h2 className="text-[40px] text-on-surface">{t(tab)}</h2>

        <SegmentedControl
          options={DASHBOARD_POOL_TYPES as unknown as DashboardPoolType[]}
          value={poolType}
          onChange={handlePoolTabChange}
        />
      </div>

      {tab === 'Overview' ? (
        <Overview poolType={poolType} />
      ) : tab === 'Pairs' ? (
        <Pools poolType={poolType} />
      ) : (
        <Tokens poolType={poolType} />
      )}
    </Page>
  )
}

// InfoPage.Layout = InfoPageLayout
InfoPage.Layout = ({ children }) => <div>{children}</div>
InfoPage.chains = [] // set all

export default InfoPage
