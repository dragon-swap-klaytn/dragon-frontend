import { TradeType } from '@pancakeswap/sdk'
import { SmartRouter, SmartRouterTrade } from '@pancakeswap/smart-router/evm'
import { Loading, QuestionHelper } from '@pancakeswap/uikit'
import { memo, ReactNode, useMemo, useState } from 'react'

import { TradeSummary } from 'views/Swap/components/AdvancedSwapDetails'

import { Transition } from '@headlessui/react'
import { CaretDown } from '@phosphor-icons/react'
import clsx from 'clsx'
import { useTranslation } from 'next-i18next'
import { RoutesBreakdown } from 'views/Swap/V3Swap/components'
import { useIsWrapping, useSlippageAdjustedAmounts } from '../hooks'
import { computeTradePriceBreakdown } from '../utils/exchange'

interface Props {
  loaded: boolean
  trade?: SmartRouterTrade<TradeType> | null
}

export const TradeDetails = memo(function TradeDetails({ loaded, trade }: Props) {
  const { t } = useTranslation()
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

  return (
    <div className="mt-4 flex flex-col items-center">
      <button
        type="button"
        onClick={() => setShow((prev) => !prev)}
        className="flex items-center space-x-1 hover:opacity-70 text-center"
      >
        <span className="text-[13px] text-on-surface-subtle">{t('Detail')}</span>

        {loaded ? (
          <CaretDown
            size={16}
            className={clsx('text-on-surface-subtle', {
              'transform rotate-180': show,
            })}
          />
        ) : (
          <Loading size={16} className="text-on-surface-subtle" />
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
      <div className="flex items-center space-x-1 text-on-surface-subtle">
        <h4>{title}</h4>

        <QuestionHelper text={questionHelperText} ml="4px" placement="top" />
      </div>

      {content}
    </div>
  )
}
