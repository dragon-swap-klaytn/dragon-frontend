import { DEFAULT_LANGUAGE } from '@pancakeswap/localization'
import { SmartRouter } from '@pancakeswap/smart-router/evm'
import Page from 'components/Layout/Page'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useMemo } from 'react'
import { useDefaultsFromURLSearch } from 'state/swap/hooks'
import { FormHeader, FormMain, PricingAndSlippage, SwapCommitButton, TradeDetails } from 'views/Swap/V3Swap/containers'
import { useSwapBestTrade } from 'views/Swap/V3Swap/hooks'

const SwapPage = () => {
  useDefaultsFromURLSearch()

  const { t } = useTranslation()
  const { isLoading, trade, refresh, syncing, error } = useSwapBestTrade()

  const tradeLoaded = !isLoading
  const price = useMemo(() => trade && SmartRouter.getExecutionPrice(trade), [trade])

  return (
    <Page title={t('Swap')} image="/images/og-images/swap.jpeg">
      <div
        className="w-full h-80 absolute top-0 -z-10 left-1/2 -translate-x-1/2"
        style={{
          background: 'linear-gradient(180deg, rgba(249, 115, 22, 0.40) 0%, rgba(249, 115, 22, 0.00) 100%)',
        }}
      />

      <div className="max-w-sm mt-10 bg-surface-raised rounded-2xl p-5 mx-auto">
        <FormHeader onRefresh={refresh} refreshDisabled={!trade} syncing={syncing} />

        <FormMain
          tradeLoading={!tradeLoaded}
          pricingAndSlippage={<PricingAndSlippage priceLoading={isLoading} price={price} showSlippage />}
          inputAmount={trade?.inputAmount}
          outputAmount={trade?.outputAmount}
          swapCommitButton={<SwapCommitButton trade={trade} tradeError={error} tradeLoading={!tradeLoaded} />}
        />

        <TradeDetails loaded={tradeLoaded} trade={trade} />
      </div>
    </Page>
  )
}

export const getStaticProps = async ({ locale }: { locale: string }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || DEFAULT_LANGUAGE, ['common'])),
    },
  }
}

export default SwapPage
