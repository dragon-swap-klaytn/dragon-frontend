import { TradeType } from '@pancakeswap/sdk'
import { SmartRouter, SmartRouterTrade } from '@pancakeswap/smart-router/evm'
import { AutoColumn, QuestionHelper } from '@pancakeswap/uikit'
import useLastTruthy from 'hooks/useLast'
import { memo, ReactNode, useMemo, useState } from 'react'

import { AdvancedSwapDetails, TradeSummary } from 'views/Swap/components/AdvancedSwapDetails'
import { AdvancedDetailsFooter } from 'views/Swap/components/AdvancedSwapDetailsDropdown'

import { Transition } from '@headlessui/react'
import { CaretDown } from '@phosphor-icons/react'
import clsx from 'clsx'
import Loading from 'components/Common/Loading'
import { MMTradeInfo } from 'views/Swap/MMLinkPools/hooks'
import { RoutesBreakdown } from 'views/Swap/V3Swap/components'
import { useIsWrapping, useSlippageAdjustedAmounts } from '../hooks'
import { computeTradePriceBreakdown } from '../utils/exchange'

interface Props {
  loaded: boolean
  trade?: SmartRouterTrade<TradeType> | null
}

export function MMTradeDetail({ loaded, mmTrade }: { loaded: boolean; mmTrade?: MMTradeInfo }) {
  const lastTrade = useLastTruthy(mmTrade?.trade)

  return (
    <AdvancedDetailsFooter show={loaded}>
      <AutoColumn gap="0px">
        {lastTrade && (
          <AdvancedSwapDetails
            pairs={[]}
            path={lastTrade?.routes[0].path}
            slippageAdjustedAmounts={mmTrade?.slippageAdjustedAmounts}
            realizedLPFee={mmTrade?.realizedLPFee}
            inputAmount={mmTrade?.inputAmount}
            outputAmount={mmTrade?.outputAmount}
            tradeType={mmTrade?.tradeType}
            priceImpactWithoutFee={mmTrade?.priceImpactWithoutFee}
            isMM
          />
        )}
      </AutoColumn>
    </AdvancedDetailsFooter>
  )
}

export const TradeDetails = memo(function TradeDetails({ loaded, trade }: Props) {
  const slippageAdjustedAmounts = useSlippageAdjustedAmounts(trade)
  const isWrapping = useIsWrapping()
  const { priceImpactWithoutFee, lpFeeAmount } = useMemo(() => computeTradePriceBreakdown(trade), [trade])
  const hasStablePool = useMemo(
    () => trade?.routes.some((route) => route.pools.some(SmartRouter.isStablePool)),
    [trade],
  )

  const [show, setShow] = useState(false)

  if (isWrapping || !loaded || !trade) {
    return null
  }

  const { inputAmount, outputAmount, tradeType, routes } = trade

  // margin-top: ${({ show }) => (show ? '16px' : 0)};
  // padding-top: 16px;
  // padding-bottom: 16px;
  // width: 100%;
  // max-width: 400px;
  // border-radius: 20px;
  // background-color: ${({ theme }) => theme.colors.invertedContrast};

  // transform: ${({ show }) => (show ? 'translateY(0%)' : 'translateY(-100%)')};
  // transition: transform 300ms ease-in-out;

  return (
    // <AdvancedDetailsFooter show={loaded}>
    <div className="mt-4 flex flex-col items-center">
      <button
        type="button"
        onClick={() => setShow((prev) => !prev)}
        className="flex items-center space-x-1 hover:opacity-70 text-center"
      >
        <span className="text-[13px]">Detail</span>

        {loaded ? (
          <CaretDown
            size={16}
            className={clsx('text-on-surface-secondary', {
              'transform rotate-180': show,
            })}
          />
        ) : (
          <Loading size={16} className="text-on-surface-secondary" />
        )}
      </button>

      <Transition
        show={loaded && show}
        enter="transition-opacity duration-100"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity duration-100"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="flex flex-col space-y-2 mt-4 w-full">
          <TradeSummary
            slippageAdjustedAmounts={slippageAdjustedAmounts}
            inputAmount={inputAmount}
            outputAmount={outputAmount}
            tradeType={tradeType}
            priceImpactWithoutFee={priceImpactWithoutFee}
            realizedLPFee={lpFeeAmount}
            hasStablePair={hasStablePool}
          />

          <RoutesBreakdown routes={routes} />
        </div>
      </Transition>

      {/* <div
      className={clsx({
        hidden: !loaded,
      })}
    >
      <TradeSummary
        slippageAdjustedAmounts={slippageAdjustedAmounts}
        inputAmount={inputAmount}
        outputAmount={outputAmount}
        tradeType={tradeType}
        priceImpactWithoutFee={priceImpactWithoutFee}
        realizedLPFee={lpFeeAmount}
        hasStablePair={hasStablePool}
      />
      <RoutesBreakdown routes={routes} />
    </div> */}
    </div>
  )
})

export function DetailContent({
  title,
  questionHelperText,
  content,
}: {
  title: string
  questionHelperText: ReactNode
  content: ReactNode
}) {
  return (
    <div className="flex items-center space-x-2 justify-between text-[13px]">
      <div className="flex items-center space-x-1 text-on-surface-secondary">
        <h4>{title}</h4>

        <QuestionHelper text={questionHelperText} ml="4px" placement="top" />
      </div>

      {content}
    </div>
  )
}
