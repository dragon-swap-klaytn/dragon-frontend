import { DEFAULT_LANGUAGE } from '@pancakeswap/localization'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { CHAIN_IDS } from 'utils/wagmi'
import PoolFinder from '../views/PoolFinder'

const PoolFinderPage = () => <PoolFinder />

PoolFinderPage.chains = CHAIN_IDS

export default PoolFinderPage

export const getStaticProps = async ({ locale }: { locale: string }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || DEFAULT_LANGUAGE, ['common'])),
    },
  }
}
