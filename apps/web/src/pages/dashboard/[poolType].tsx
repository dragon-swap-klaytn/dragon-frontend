import { useTranslation } from '@pancakeswap/localization'
import { SegmentedControl } from '@pancakeswap/uikit'
import Page from 'components/Layout/Page'
import { atom } from 'jotai'
import { GetStaticPaths, GetStaticProps } from 'next'
import { useRouter } from 'next/router'
import { PoolType } from 'types'
import { getTokenStaticPaths } from 'utils/pageUtils'
import Overview from 'views/Dashboard/OverView'

export const DASHBOARD_TABS = ['Overview', 'Pairs', 'Tokens'] as const
export type DashboardTabType = (typeof DASHBOARD_TABS)[number]

export const DASHBOARD_POOL_TYPES = ['v3', 'v2'] as const

export const dashboardTabAtom = atom<DashboardTabType>('Overview')

const InfoPage = ({ poolType }: { poolType: PoolType }) => {
  const router = useRouter()
  const { t } = useTranslation()

  return (
    <Page className="w-full flex flex-col items-center space-y-8">
      <div className="flex flex-wrap items-center w-full justify-between gap-2">
        <h2 className="text-[40px] text-on-surface">{t('Dashboard')}</h2>

        <SegmentedControl
          options={DASHBOARD_POOL_TYPES as unknown as PoolType[]}
          value={poolType}
          onChange={(newPoolType) => router.push(`/dashboard/${newPoolType}`)}
        />
      </div>

      <Overview poolType={poolType} />
    </Page>
  )
}

// InfoPage.Layout = InfoPageLayout
InfoPage.Layout = ({ children }) => <div>{children}</div>
InfoPage.chains = [] // set all

export default InfoPage

export const getStaticPaths: GetStaticPaths = getTokenStaticPaths()
export const getStaticProps: GetStaticProps = async ({ params }) => {
  const poolType = params?.poolType

  if (poolType !== 'v2' && poolType !== 'v3') {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    }
  }

  return {
    props: {
      poolType,
    },
  }
}
