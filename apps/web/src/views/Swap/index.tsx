import { Currency } from '@pancakeswap/sdk'
import { useMatchBreakpoints } from '@pancakeswap/uikit'
import replaceBrowserHistory from '@pancakeswap/utils/replaceBrowserHistory'
import { useRouter } from 'next/router'
import { useCallback, useEffect } from 'react'
import { useSwapActionHandlers } from 'state/swap/useSwapActionHandlers'
import { currencyId } from 'utils/currencyId'

import { useCurrency } from 'hooks/Tokens'
import { Field } from 'state/swap/actions'
// import { useDefaultsFromURLSearch, useSingleTokenSwapInfo, useSwapState } from 'state/swap/hooks'
import { useDefaultsFromURLSearch, useSwapState } from 'state/swap/hooks'
// import HotTokenList from './components/HotTokenList'
import { SwapFeaturesContext } from './SwapFeaturesContext'
import { V3SwapForm } from './V3Swap'
import useWarningImport from './hooks/useWarningImport'

export default function Swap() {
  const { query } = useRouter() //= {inputCurrency, outputCurrency, chain name}

  const { isDesktop } = useMatchBreakpoints()
  // const {
  //   isChartExpanded,
  //   isChartDisplayed,
  //   setIsChartDisplayed,
  //   setIsChartExpanded,
  //   isChartSupported,
  //   isHotTokenSupported,
  // } = useContext(SwapFeaturesContext)
  // useEffect(() => {
  //   console.log('isChartSupported', isChartSupported)
  // }, [isChartSupported])
  useEffect(() => {
    console.log('SwapFeaturesContext', SwapFeaturesContext)
  }, [SwapFeaturesContext])
  // const [isSwapHotTokenDisplay, setIsSwapHotTokenDisplay] = useSwapHotTokenDisplay()
  // const { t } = useTranslation()
  // const [firstTime, setFirstTime] = useState(true)

  // useEffect(() => {
  //   if (firstTime && query.showTradingReward) {
  //     setFirstTime(false)
  //     setIsSwapHotTokenDisplay(true)

  //     // if (!isSwapHotTokenDisplay && isChartDisplayed) {
  //     //   setIsChartDisplayed((currentIsChartDisplayed) => !currentIsChartDisplayed)
  //     // }
  //   }
  //   // }, [firstTime, isChartDisplayed, isSwapHotTokenDisplay, query, setIsSwapHotTokenDisplay, setIsChartDisplayed])
  // }, [firstTime, isSwapHotTokenDisplay, query, setIsSwapHotTokenDisplay])

  // swap state & price data
  const {
    [Field.INPUT]: { currencyId: inputCurrencyId },
    [Field.OUTPUT]: { currencyId: outputCurrencyId },
  } = useSwapState()
  const inputCurrency = useCurrency(inputCurrencyId)
  const outputCurrency = useCurrency(outputCurrencyId)

  const currencies: { [field in Field]?: Currency } = {
    [Field.INPUT]: inputCurrency ?? undefined,
    [Field.OUTPUT]: outputCurrency ?? undefined,
  }

  // const singleTokenPrice = useSingleTokenSwapInfo(
  //   inputCurrencyId,
  //   inputCurrency,
  //   outputCurrencyId,
  //   outputCurrency,
  //   // isChartSupported,
  //   false,
  // )
  const warningSwapHandler = useWarningImport()
  useDefaultsFromURLSearch()
  const { onCurrencySelection } = useSwapActionHandlers()

  const handleOutputSelect = useCallback(
    (newCurrencyOutput: Currency) => {
      onCurrencySelection(Field.OUTPUT, newCurrencyOutput)
      warningSwapHandler(newCurrencyOutput)

      const newCurrencyOutputId = currencyId(newCurrencyOutput)
      if (newCurrencyOutputId === inputCurrencyId) {
        replaceBrowserHistory('inputCurrency', outputCurrencyId)
      }
      replaceBrowserHistory('outputCurrency', newCurrencyOutputId)
    },

    [inputCurrencyId, outputCurrencyId, onCurrencySelection, warningSwapHandler],
  )

  return (
    // <Page removePadding={isChartExpanded} hideFooterOnDesktop={isChartExpanded}>
    // <Page removePadding={false} hideFooterOnDesktop={false}>
    <div className="h-full bg-on-surface-orange pt-5">
      {/* <Flex width={['328px', '100%']} height="100%" justifyContent="center" position="relative" alignItems="flex-start"> */}
      {/* {isDesktop && isChartSupported && (
          <PriceChartContainer
            inputCurrencyId={inputCurrencyId}
            inputCurrency={currencies[Field.INPUT]}
            outputCurrencyId={outputCurrencyId}
            outputCurrency={currencies[Field.OUTPUT]}
            isChartExpanded={isChartExpanded}
            setIsChartExpanded={setIsChartExpanded}
            isChartDisplayed={isChartDisplayed}
            currentSwapPrice={singleTokenPrice}
          />
        )} */}
      {/* {!isDesktop && isChartSupported && (
          <BottomDrawer
            content={
              <PriceChartContainer
                inputCurrencyId={inputCurrencyId}
                inputCurrency={currencies[Field.INPUT]}
                outputCurrencyId={outputCurrencyId}
                outputCurrency={currencies[Field.OUTPUT]}
                isChartExpanded={isChartExpanded}
                setIsChartExpanded={setIsChartExpanded}
                isChartDisplayed={isChartDisplayed}
                currentSwapPrice={singleTokenPrice}
                isFullWidthContainer
                isMobile
              />
            }
            isOpen={isChartDisplayed}
            setIsOpen={setIsChartDisplayed}
          />
        )} */}

      {/* <ModalV2
          isOpen={!isDesktop && isSwapHotTokenDisplay && isHotTokenSupported}
          onDismiss={() => setIsSwapHotTokenDisplay(false)}
        >
          <Modal
            style={{ padding: 0 }}
            title={t('Top Token')}
            onDismiss={() => setIsSwapHotTokenDisplay(false)}
            bodyPadding="0px"
          >
            <HotTokenList
              handleOutputSelect={(newCurrencyOutput: Currency) => {
                handleOutputSelect(newCurrencyOutput)
                setIsSwapHotTokenDisplay(false)
              }}
            />
          </Modal>
        </ModalV2> */}
      {/* <Flex flexDirection="column"> */}
      {/* <StyledSwapContainer $isChartExpanded={isChartExpanded}> */}
      {/* <StyledSwapContainer $isChartExpanded={false}> */}

      {/* <StyledInputCurrencyWrapper mt={isChartExpanded ? '24px' : '0'}> */}
      {/* <StyledInputCurrencyWrapper mt={false ? '24px' : '0'}> */}
      <div className="max-w-sm mx-auto bg-surface-container rounded-2xl p-5">
        {/* <AppBody> */}
        <V3SwapForm />
        {/* </AppBody> */}
      </div>
      {/* </StyledInputCurrencyWrapper> */}

      {/* </StyledSwapContainer> */}
      {/* </Flex> */}
      {/* </Flex> */}
    </div>
  )
}
