import { SmartRouter } from '@pancakeswap/smart-router/evm'
import throttle from 'lodash/throttle'
import { useMemo } from 'react'

import { FormHeader, FormMain, PricingAndSlippage, SwapCommitButton, TradeDetails } from './containers'
import { useSwapBestTrade } from './hooks'
import { useCheckInsufficientError } from './hooks/useCheckSufficient'

export function V3SwapForm() {
  const { isLoading, trade, refresh, syncing, isStale, error } = useSwapBestTrade()
  // useEffect(() => {
  //   console.log('isLoading', isLoading)
  // }, [isLoading])
  // useEffect(() => {
  //   console.log('trade', trade)
  // }, [trade])
  // useEffect(() => {
  //   console.log('error', error)
  // }, [error])
  // const mm = useDerivedBestTradeWithMM(trade)
  // useEffect(() => {
  //   console.log('mm', mm)
  // }, [mm])
  const throttledHandleRefresh = useMemo(
    () =>
      throttle(() => {
        refresh()
      }, 3_000),
    [refresh],
  )

  // const finalTrade = mm.isMMBetter ? mm?.mmTradeInfo?.trade : trade

  const tradeLoaded = !isLoading
  const price = useMemo(() => trade && SmartRouter.getExecutionPrice(trade), [trade])

  const insufficientFundCurrency = useCheckInsufficientError(trade)

  // useEffect(() => {
  //   console.log('tradeLoaded', tradeLoaded)
  // }, [tradeLoaded])
  // useEffect(() => {
  //   console.log('syncing', syncing)
  // }, [syncing])
  // useEffect(() => {
  //   console.log('isStale', isStale)
  // }, [isStale])

  return (
    <>
      <FormHeader onRefresh={throttledHandleRefresh} refreshDisabled={!tradeLoaded || syncing || !isStale} />

      <FormMain
        tradeLoading={!tradeLoaded}
        pricingAndSlippage={<PricingAndSlippage priceLoading={isLoading} price={price} showSlippage />}
        inputAmount={trade?.inputAmount}
        outputAmount={trade?.outputAmount}
        swapCommitButton={<SwapCommitButton trade={trade} tradeError={error} tradeLoading={!tradeLoaded} />}
      />

      {/* <BuyCryptoLink currency={insufficientFundCurrency} /> */}

      <TradeDetails loaded={tradeLoaded} trade={trade} />

      {/* {mm.isMMBetter ? (
        <MMTradeDetail loaded={!mm.mmOrderBookTrade.isLoading} mmTrade={mm.mmTradeInfo} />
      ) : (
        <TradeDetails loaded={tradeLoaded} trade={trade} />
      )} */}
      {/* {(shouldShowMMLiquidityError(mm?.mmOrderBookTrade?.inputError) || mm?.mmRFQTrade?.error) && !trade && (
        <Box mt="5px">
          <MMLiquidityWarning />
        </Box>
      )} */}
    </>
  )
}
