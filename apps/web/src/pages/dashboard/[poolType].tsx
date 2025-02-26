import { DEFAULT_LANGUAGE, useTranslation } from '@pancakeswap/localization'
import { SegmentedControl } from '@pancakeswap/uikit'
import Page from 'components/Layout/Page'
import { atom } from 'jotai'
import { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useRouter } from 'next/router'
import { ParsedUrlQuery } from 'querystring'
import { PoolType } from 'types'
import Overview from 'views/Dashboard/OverView'

export const DASHBOARD_TABS = ['Overview', 'Pairs', 'Tokens'] as const
export type DashboardTabType = (typeof DASHBOARD_TABS)[number]

export const DASHBOARD_POOL_TYPES = ['v3', 'v2'] as const

export const dashboardTabAtom = atom<DashboardTabType>('Overview')

export const getStaticPaths = (({ locales }) => {
  if (!locales) {
    return {
      paths: [],
      fallback: true,
    }
  }

  return {
    paths: DASHBOARD_POOL_TYPES.flatMap((poolType) =>
      locales.map((locale) => ({
        params: { poolType },
        locale,
      })),
    ),
    fallback: false,
  }
}) satisfies GetStaticPaths

export const getStaticProps = (async ({ params, locale }) => {
  const poolType = params?.poolType

  if (!poolType || typeof poolType !== 'string' || !DASHBOARD_POOL_TYPES.includes(poolType as PoolType)) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    }
  }

  return {
    props: {
      poolType: poolType as PoolType,
      ...(await serverSideTranslations(locale || DEFAULT_LANGUAGE, ['common'])),
    },
  }
}) satisfies GetStaticProps<
  {
    poolType: PoolType
    _nextI18Next?: any
  },
  ParsedUrlQuery
>

const InfoPage = ({ poolType }: InferGetStaticPropsType<typeof getStaticProps>) => {
  const router = useRouter()
  const { t } = useTranslation()

  return (
    <Page
      title={t('Dashboard')}
      image="/images/og-images/dashboard.jpeg"
      className="w-full flex flex-col items-center space-y-8"
    >
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

export default InfoPage
