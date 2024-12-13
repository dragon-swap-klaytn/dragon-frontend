import { SmartRouter } from '@pancakeswap/smart-router/evm'
import { useMemo } from 'react'

import { FormHeader, FormMain, PricingAndSlippage, SwapCommitButton, TradeDetails } from './containers'
import { useSwapBestTrade } from './hooks'

export function V3SwapForm() {
  const { isLoading, trade, refresh, syncing, error } = useSwapBestTrade()

  const tradeLoaded = !isLoading
  const price = useMemo(() => trade && SmartRouter.getExecutionPrice(trade), [trade])

  return (
    <>
      <FormHeader onRefresh={refresh} refreshDisabled={!trade} syncing={syncing} />

      <FormMain
        tradeLoading={!tradeLoaded}
        pricingAndSlippage={<PricingAndSlippage priceLoading={isLoading} price={price} showSlippage />}
        inputAmount={trade?.inputAmount}
        outputAmount={trade?.outputAmount}
        swapCommitButton={<SwapCommitButton trade={trade} tradeError={error} tradeLoading={!tradeLoaded} />}
      />

      <TradeDetails loaded={tradeLoaded} trade={trade} />
    </>
  )
}
