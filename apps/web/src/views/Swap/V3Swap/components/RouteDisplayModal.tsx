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
    <ModalV2 closeOnOverlayClick isOpen={isOpen} onDismiss={onDismiss} minHeight="0">
      <Modal
        title={
          // <Flex justifyContent="center">
          <div className="flex items-center space-x-1">
            <span>{t('Route')}</span>

            <QuestionHelper
              text={t('Routing through these tokens resulted in the best price for your trade.')}
              ml="4px"
              placement="top-start"
            />
          </div>
        }
        style={{ minHeight: '0' }}
        bodyPadding="24px"
      >
        {/* <AutoColumn gap="48px"> */}
        <div className="mt-10">
          {routes.map((route, i) => (
            // eslint-disable-next-line react/no-array-index-key
            <RouteDisplay key={i} route={route} />
          ))}
          {/* <RoutingSettingsButton /> */}
        </div>
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
    // <AutoColumn gap="24px">
    <div className="flex flex-col">
      {/* <RouterBox justifyContent="space-between" alignItems="center"> */}

      {/* position: relative;
  flex-direction: row;

  &:before {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    width: 100%;
    height: 3px;
    border-top: 3px dotted ${({ theme }) => theme.colors.backgroundDisabled};
    transform: translateY(-50%);
    z-index: 1;
  }

  ${({ theme }) => theme.mediaQueries.md} {
    min-width: 400px;
  } */}

      {/* <div className='flex relative before:content-[''] before:position-absolute before:top-1/2 before:left-0 before:w-full before:h-3px before:border-t-3px before:dotted before:border-backgroundDisabled before:transform-translate-y-[-50%] before:z-1'> */}
      <div className="relative flex flex-row before:absolute before:top-[16px] md:before:top-5 before:left-0 before:w-[96%] before:mx-2 before:h-[3px] before:border-t-2 before:border-dotted before:border-backgroundDisabled before:transform before:-translate-y-1/2 before:z-[1] md:min-w-[400px] justify-between">
        {/* export const CurrencyLogoWrapper = styled(AtomBox)`
  position: relative;
  padding: 2px;
  background: linear-gradient(180deg, #53dee9 0%, #7645d9 76.22%);
  border-radius: 50%;
  z-index: 2;
` */}

        {/* <CurrencyLogoWrapper
          size={{
            xs: '32px',
            md: '48px',
          }}
          ref={targetRef}
        > */}
        <div className="flex flex-col items-center space-y-1">
          <div
            // size={{
            //   xs: '32px',
            //   md: '48px',
            // }}
            ref={targetRef}
            className="relative p-[2px] bg-gradient-to-b from-[#53dee9] to-[#7645d9] rounded-full z-10 w-8 h-8 md:w-10 md:h-10"
          >
            <CurrencyLogo size="100%" currency={inputCurrency} />
            {/* <RouterTypeText fontWeight="bold">{route.percent}%</RouterTypeText> */}
          </div>

          <span className="text-sm">{route.percent}%</span>
        </div>
        {tooltipVisible && tooltip}
        {pairNodes}
        {/* <CurrencyLogoWrapper
          size={{
            xs: '32px',
            md: '48px',
          }}
          ref={outputTargetRef}
        > */}
        <div
          // size={{
          //   xs: '32px',
          //   md: '48px',
          // }}
          ref={outputTargetRef}
          className="relative p-[2px] bg-gradient-to-b from-[#53dee9] to-[#7645d9] rounded-full z-10 w-8 h-8 md:w-10 md:h-10"
        >
          <CurrencyLogo size="100%" currency={outputCurrency} />
        </div>
        {outputTooltipVisible && outputTooltip}
      </div>
    </div>
  )
})

function PairNode({
  pair,
  text,
  // className,
  tooltipText,
}: {
  pair: Pair
  text: string
  // className: string
  tooltipText: string
}) {
  const [input, output] = pair

  const tooltip = useTooltip(tooltipText)

  //   export const RouterPoolBox = styled(Box)`
  //   position: relative;
  //   border-radius: 50px;
  //   display: flex;
  //   flex-direction: row;
  //   padding: 2px 4px;
  //   background-color: ${({ theme }) => theme.colors.backgroundDisabled};
  //   z-index: 2;
  //   svg,
  //   img {
  //     &:first-child {
  //       margin-bottom: 2px;
  //       ${({ theme }) => theme.mediaQueries.md} {
  //         margin-bottom: 0px;
  //         margin-right: 2px;
  //       }
  //     }
  //   }
  //   &.isStableSwap,
  //   &.highlight {
  //     background-color: ${({ theme }) => theme.colors.secondary};
  //   }
  //   ${({ theme }) => theme.mediaQueries.md} {
  //     padding: 4px 8px;
  //   }
  // `

  return (
    // <RouterPoolBox className={className} ref={tooltip.targetRef}>
    <div className="flex flex-col items-center space-y-1">
      <div
        className="flex items-center space-x-1 z-50 px-1 py-1 rounded-[20px] bg-surface-container-highest"
        ref={tooltip.targetRef}
      >
        {tooltip.tooltipVisible && tooltip.tooltip}
        {/* <AtomBox
        size={{
          xs: '24px',
          md: '32px',
        }}
      > */}
        <div className="w-6 h-6 md:w-8 md:h-8">
          <CurrencyLogo size="100%" currency={input} />
        </div>
        {/* <AtomBox
        size={{
          xs: '24px',
          md: '32px',
        }}
      > */}
        <div className="w-6 h-6 md:w-8 md:h-8">
          <CurrencyLogo size="100%" currency={output} />
        </div>
      </div>
      {/* <RouterTypeText>{text}</RouterTypeText> */}

      <span className="text-sm">{text}</span>
    </div>
  )
}

// export const RouterTypeText = styled.div<{ fontWeight?: string }>`
//   font-size: 14px;
//   line-height: 16px;
//   color: ${({ theme }) => theme.colors.text};
//   position: absolute;
//   transform: translateY(-50%);
//   white-space: nowrap;
//   left: 50%;
//   transform: translateX(-50%);
//   top: calc(100% + 3px);
//   font-weight: ${(props) => props.fontWeight || 'normal'};

//   ${({ theme }) => theme.mediaQueries.md} {
//     font-size: 16px;
//     line-height: 20px;
//   }
// `
