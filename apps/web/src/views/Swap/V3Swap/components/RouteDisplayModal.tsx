import { useTranslation } from '@pancakeswap/localization'
import { Currency } from '@pancakeswap/sdk'
import { Route, SmartRouter } from '@pancakeswap/smart-router/evm'
import { Modal, ModalV2, QuestionHelper, Text, UseModalV2Props, useTooltip } from '@pancakeswap/uikit'
import { CurrencyLogo } from '@pancakeswap/widgets-internal'
import { memo, useMemo } from 'react'

import { v3FeeToPercent } from '../utils/exchange'

type Pair = [Currency, Currency]

interface Props extends UseModalV2Props {
  routes: Route[]
}

export const RouteDisplayModal = memo(function RouteDisplayModal({ isOpen, onDismiss, routes }: Props) {
  const { t } = useTranslation()
  return (
    <ModalV2 closeOnOverlayClick isOpen={isOpen} onDismiss={onDismiss}>
      <Modal
        title={
          <div className="flex items-center space-x-1">
            <span>{t('Route')}</span>

            <QuestionHelper
              text={t('Routing through these tokens resulted in the best price for your trade.')}
              ml="4px"
              placement="top-start"
            />
          </div>
        }
      >
        {routes.map((route, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <RouteDisplay key={`route:${i}`} route={route} />
        ))}
        {/* <RoutingSettingsButton /> */}
      </Modal>
    </ModalV2>
  )
})

interface RouteDisplayProps {
  route: Route
}

export const RouteDisplay = memo(function RouteDisplay({ route }: RouteDisplayProps) {
  const { t } = useTranslation()
  const { path, pools, inputAmount, outputAmount } = route
  const { currency: inputCurrency } = inputAmount
  const { currency: outputCurrency } = outputAmount
  const { targetRef, tooltip, tooltipVisible } = useTooltip(<Text>{inputCurrency.symbol}</Text>, {
    placement: 'right',
  })

  const {
    targetRef: outputTargetRef,
    tooltip: outputTooltip,
    tooltipVisible: outputTooltipVisible,
  } = useTooltip(<Text>{outputCurrency.symbol}</Text>, {
    placement: 'right',
  })

  const pairs = useMemo<Pair[]>(() => {
    if (path.length <= 1) {
      return []
    }

    const currencyPairs: Pair[] = []
    for (let i = 0; i < path.length - 1; i += 1) {
      currencyPairs.push([path[i], path[i + 1]])
    }
    return currencyPairs
  }, [path])

  const pairNodes =
    pairs.length > 0
      ? pairs.map((p, index) => {
          const [input, output] = p
          const pool = pools[index]
          const isV3Pool = SmartRouter.isV3Pool(pool)
          const isV2Pool = SmartRouter.isV2Pool(pool)
          const key = isV2Pool ? `v2_${pool.reserve0.currency.symbol}_${pool.reserve1.currency.symbol}` : pool.address
          const text = isV2Pool
            ? 'V2'
            : isV3Pool
            ? `V3 (${v3FeeToPercent(pool.fee).toSignificant(6)}%)`
            : t('StableSwap')
          const tooltipText = `${input.symbol}/${output.symbol}${
            isV3Pool ? ` (${v3FeeToPercent(pool.fee).toSignificant(6)}%)` : ''
          }`
          return <PairNode pair={p} key={key} text={text} tooltipText={tooltipText} />
        })
      : null

  return (
    <div className="relative flex flex-row before:absolute before:top-[16px] md:before:top-5 before:left-0 before:w-[96%] before:mx-2 before:h-[3px] before:border-t-2 before:border-dotted before:border-backgroundDisabled before:transform before:-translate-y-1/2 before:z-[1] md:min-w-[400px] justify-between">
      <div className="flex flex-col items-center space-y-1">
        <div ref={targetRef} className="z-10">
          <CurrencyLogo size={40} currency={inputCurrency} />
        </div>

        <span className="text-sm text-on-surface-primary">{route.percent}%</span>
      </div>
      {tooltipVisible && tooltip}
      {pairNodes}
      <div ref={outputTargetRef} className="z-10">
        <CurrencyLogo size={40} currency={outputCurrency} />
      </div>
      {outputTooltipVisible && outputTooltip}
    </div>
  )
})

function PairNode({ pair, text, tooltipText }: { pair: Pair; text: string; tooltipText: string }) {
  const [input, output] = pair

  const tooltip = useTooltip(tooltipText)

  return (
    <div className="flex flex-col items-center space-y-1">
      <div
        className="flex items-center space-x-1 z-50 px-1 py-1 rounded-[20px] bg-surface-container-highest"
        ref={tooltip.targetRef}
      >
        {tooltip.tooltipVisible && tooltip.tooltip}
        <div className="flex items-center space-x-1">
          <CurrencyLogo size={32} currency={input} />
          <CurrencyLogo size={32} currency={output} />
        </div>
      </div>

      <span className="text-sm text-on-surface-primary">{text}</span>
    </div>
  )
}
