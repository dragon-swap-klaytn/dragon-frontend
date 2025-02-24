import { CHAIN_IDS } from 'utils/wagmi'

import { DEFAULT_LANGUAGE } from '@pancakeswap/localization'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { SwapFeaturesProvider } from 'views/Swap/SwapFeaturesContext'
import Swap from '../views/Swap'

const SwapPage = () => {
  return (
    <SwapFeaturesProvider>
      <Swap />
    </SwapFeaturesProvider>
  )
}

export const getStaticProps = async ({ locale }: { locale: string }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || DEFAULT_LANGUAGE, ['common'])),
    },
  }
}

SwapPage.chains = CHAIN_IDS

export default SwapPage
