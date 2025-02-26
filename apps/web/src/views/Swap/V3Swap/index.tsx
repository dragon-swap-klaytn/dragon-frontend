import { SmartRouter } from '@pancakeswap/smart-router/evm'
import { useMemo } from 'react'

import Page from 'components/Layout/Page'
import { useTranslation } from 'next-i18next'
import { FormHeader, FormMain, PricingAndSlippage, SwapCommitButton, TradeDetails } from './containers'
import { useSwapBestTrade } from './hooks'

export function V3SwapForm() {
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

      <div className="max-w-sm bg-surface-raised rounded-2xl p-5 mx-auto">
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
