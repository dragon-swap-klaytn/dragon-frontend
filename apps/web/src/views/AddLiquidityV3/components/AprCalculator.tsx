import { useTranslation } from '@pancakeswap/localization'
import { Currency, CurrencyAmount, Token } from '@pancakeswap/sdk'
import { QuestionHelper, Text, TooltipText } from '@pancakeswap/uikit'
import { BIG_ZERO } from '@pancakeswap/utils/bigNumber'
import { FeeCalculator, Pool, isPoolTickInRange, parseProtocolFees } from '@pancakeswap/v3-sdk'
import {
  RoiCalculatorModalV2,
  RoiCalculatorPositionInfo,
  useAmountsByUsdValue,
} from '@pancakeswap/widgets-internal/roi'
import { useRouter } from 'next/router'
import { useCallback, useMemo, useState } from 'react'

import { PositionDetails, getPositionFarmApr, getPositionFarmAprFactor } from '@pancakeswap/farms'
import { Bound } from 'config/constants/types'
import { useFarm } from 'hooks/useFarm'
import { useDerivedPositionInfo } from 'hooks/v3/useDerivedPositionInfo'
import { useAllV3Ticks } from 'hooks/v3/usePoolTickData'
import useV3DerivedInfo from 'hooks/v3/useV3DerivedInfo'
import { batch } from 'react-redux'
import { Field } from 'state/mint/actions'
import currencyId from 'utils/currencyId'

import { Calculator } from '@phosphor-icons/react'
import useTokenPricesWithFallback from 'hooks/useTokenPricesWithFallback'
import { PoolV3Parsed } from 'pages/api/pools'
import { calculateAPR } from 'utils/calculate-interests'
import usePools, { buildUsePoolsSearchParams } from 'views/Dashboard/hooks/usePools'
import { useV3MintActionHandlers } from '../formViews/V3FormView/form/hooks/useV3MintActionHandlers'
import { useV3FormState } from '../formViews/V3FormView/form/reducer'

interface Props {
  baseCurrency?: Currency | null
  quoteCurrency?: Currency | null
  feeAmount?: number
  showTitle?: boolean
  showQuestion?: boolean
  allowApply?: boolean
  positionDetails?: PositionDetails
  defaultDepositUsd?: string
  tokenAmount0?: CurrencyAmount<Token>
  tokenAmount1?: CurrencyAmount<Token>
  className?: string
  excludePositionLiquidity?: boolean
}

export function AprCalculator({
  baseCurrency,
  quoteCurrency,
  feeAmount,
  showTitle = true,
  showQuestion = false,
  allowApply = true,
  positionDetails,
  defaultDepositUsd,
  tokenAmount0,
  tokenAmount1,
  className,
  excludePositionLiquidity = false,
}: Props) {
  const { t } = useTranslation()
  const [isOpen, setOpen] = useState(false)
  const [priceSpan, setPriceSpan] = useState(0)
  const { data: farm } = useFarm({ currencyA: baseCurrency, currencyB: quoteCurrency, feeAmount })
  const { priceMap } = useTokenPricesWithFallback()

  const tokenA = (baseCurrency ?? undefined)?.wrapped
  const tokenB = (quoteCurrency ?? undefined)?.wrapped

  const cakePrice = priceMap.KAIA
  const currencyAUsdPrice = tokenA ? priceMap[tokenA.address.toLowerCase()] : undefined
  const currencyBUsdPrice = tokenB ? priceMap[tokenB.address.toLowerCase()] : undefined

  const formState = useV3FormState()

  const { position: existingPosition } = useDerivedPositionInfo(positionDetails)
  const { pool, ticks, price, pricesAtTicks, parsedAmounts, currencyBalances } = useV3DerivedInfo(
    baseCurrency ?? undefined,
    quoteCurrency ?? undefined,
    feeAmount,
    baseCurrency ?? undefined,
    existingPosition,
    formState,
  )
  const router = useRouter()
  const poolAddress = useMemo(() => (pool ? Pool.getAddress(pool.token0, pool.token1, pool.fee) : undefined), [pool])

  const query = buildUsePoolsSearchParams({ addresses: [poolAddress?.toLowerCase() ?? ''] })
  const { poolsData } = usePools(query.toString(), { paused: !poolAddress || !query })

  const poolData = poolsData && poolsData[0] ? poolsData[0] : undefined

  const { ticks: data } = useAllV3Ticks(baseCurrency, quoteCurrency, feeAmount)
  const volume24H = poolData?.volumeUSD['24H']
  const sqrtRatioX96 = poolData ? BigInt((poolData as PoolV3Parsed)?.sqrtPriceX96) : undefined
  const { [Bound.LOWER]: tickLower, [Bound.UPPER]: tickUpper } = ticks
  const { [Bound.LOWER]: priceLower, [Bound.UPPER]: priceUpper } = pricesAtTicks
  const { [Field.CURRENCY_A]: amountA, [Field.CURRENCY_B]: amountB } = parsedAmounts

  const inverted = useMemo(
    () => Boolean(tokenA && tokenB && tokenA?.address !== tokenB?.address && tokenB.sortsBefore(tokenA)),
    [tokenA, tokenB],
  )

  const depositUsd = useMemo(
    () =>
      amountA &&
      amountB &&
      currencyAUsdPrice &&
      currencyBUsdPrice &&
      String(parseFloat(amountA.toExact()) * currencyAUsdPrice + parseFloat(amountB.toExact()) * currencyBUsdPrice),
    [amountA, amountB, currencyAUsdPrice, currencyBUsdPrice],
  )

  // For now the protocol fee is the same on both tokens so here we just use the fee on token0
  const [protocolFee] = useMemo(
    () => (pool?.feeProtocol && parseProtocolFees(pool.feeProtocol)) || [],
    [pool?.feeProtocol],
  )

  const applyProtocolFee = defaultDepositUsd ? undefined : protocolFee

  const { amountA: aprAmountA, amountB: aprAmountB } = useAmountsByUsdValue({
    usdValue: '1',
    currencyA: inverted ? tokenB : tokenA,
    currencyB: inverted ? tokenA : tokenB,
    price,
    priceLower,
    priceUpper,
    sqrtRatioX96,
    currencyAUsdPrice: inverted ? currencyBUsdPrice : currencyAUsdPrice,
    currencyBUsdPrice: inverted ? currencyAUsdPrice : currencyBUsdPrice,
  })

  const validAmountA = amountA || (inverted ? tokenAmount1 : tokenAmount0) || (inverted ? aprAmountB : aprAmountA)
  const validAmountB = amountB || (inverted ? tokenAmount0 : tokenAmount1) || (inverted ? aprAmountA : aprAmountB)

  const { lpApr } = useMemo(() => {
    if (
      !pool ||
      !tickUpper ||
      !tickLower ||
      !volume24H ||
      !sqrtRatioX96 ||
      !feeAmount ||
      !currencyAUsdPrice ||
      !currencyBUsdPrice ||
      (validAmountA.toExact() === '0' && validAmountB.toExact() === '0')
    ) {
      return { lpApr: 0 }
    }

    const fee = applyProtocolFee ? parseFloat(applyProtocolFee.toSignificant()) : 0

    const fee24HFraction = FeeCalculator.getEstimatedLPFeeByAmounts({
      amountA: validAmountA,
      amountB: validAmountB,
      tickUpper,
      tickLower,
      volume24H: volume24H * (1 - fee / 100),
      sqrtRatioX96,
      mostActiveLiquidity: pool.liquidity,
      fee: feeAmount,
    })

    const estimatedFee24H = +fee24HFraction.toSignificant(6)
    const positionLiquidity =
      parseFloat(validAmountA.toExact()) * currencyAUsdPrice + parseFloat(validAmountB.toExact()) * currencyBUsdPrice
    const duration = 24 * 60 * 60 * 1000

    return {
      lpApr: calculateAPR({
        interest: estimatedFee24H,
        principal: positionLiquidity,
        duration,
      }),
    }
  }, [
    pool,
    tickUpper,
    tickLower,
    volume24H,
    sqrtRatioX96,
    feeAmount,
    currencyAUsdPrice,
    currencyBUsdPrice,
    validAmountA,
    validAmountB,
    applyProtocolFee,
  ])

  const positionLiquidity = useMemo(
    () =>
      existingPosition?.liquidity ||
      (validAmountA &&
        validAmountB &&
        sqrtRatioX96 &&
        typeof tickLower === 'number' &&
        typeof tickUpper === 'number' &&
        tickLower < tickUpper &&
        FeeCalculator.getLiquidityByAmountsAndPrice({
          amountA: validAmountA,
          amountB: validAmountB,
          tickUpper,
          tickLower,
          sqrtRatioX96,
        })),
    [existingPosition, validAmountA, validAmountB, tickUpper, tickLower, sqrtRatioX96],
  )
  const [amount0, amount1] = inverted ? [validAmountB, validAmountA] : [validAmountA, validAmountB]
  const inRange = useMemo(() => isPoolTickInRange(pool, tickLower, tickUpper), [pool, tickLower, tickUpper])
  const { positionFarmApr, positionFarmAprFactor } = useMemo(() => {
    if (
      !farm ||
      !cakePrice ||
      !positionLiquidity ||
      !amount0 ||
      !amount1 ||
      !inRange ||
      !priceMap[tokenA?.address.toLowerCase() ?? ''] ||
      !priceMap[tokenB?.address.toLowerCase() ?? '']
    ) {
      return {
        positionFarmApr: '0',
        positionFarmAprFactor: BIG_ZERO,
      }
    }
    const { farm: farmDetail, cakePerSecond } = farm
    const { poolWeight, token, quoteToken, lmPoolLiquidity } = farmDetail
    const [token0Price, token1Price] = token.sortsBefore(quoteToken)
      ? [priceMap[token.address.toLowerCase()] ?? 0, priceMap[quoteToken.address.toLowerCase()] ?? 0]
      : [priceMap[quoteToken.address.toLowerCase()] ?? 0, priceMap[token.address.toLowerCase()] ?? 0]
    const positionTvlUsd = +amount0.toExact() * +token0Price + +amount1.toExact() * +token1Price

    return {
      positionFarmApr: getPositionFarmApr({
        poolWeight,
        positionTvlUsd,
        cakePriceUsd: cakePrice,
        liquidity: positionLiquidity,
        cakePerSecond,
        totalStakedLiquidity: lmPoolLiquidity,
        excludePositionLiquidity,
      }),
      positionFarmAprFactor: getPositionFarmAprFactor({
        poolWeight,
        cakePriceUsd: cakePrice,
        liquidity: positionLiquidity,
        cakePerSecond,
        totalStakedLiquidity: lmPoolLiquidity,
        excludePositionLiquidity,
      }),
    }
  }, [
    farm,
    cakePrice,
    positionLiquidity,
    amount0,
    amount1,
    inRange,
    excludePositionLiquidity,
    priceMap,
    tokenA,
    tokenB,
  ])

  // NOTE: Assume no liquidity when opening modal
  const { onFieldAInput, onBothRangeInput, onSetFullRange } = useV3MintActionHandlers(false)

  const closeModal = useCallback(() => setOpen(false), [])
  const onApply = useCallback(
    (position: RoiCalculatorPositionInfo) => {
      batch(() => {
        const isToken0Price =
          position.amountA?.wrapped?.currency &&
          position.amountB?.wrapped?.currency &&
          position.amountA.wrapped.currency.sortsBefore(position.amountB.wrapped.currency)
        if (position.fullRange) {
          onSetFullRange()
        } else {
          onBothRangeInput({
            leftTypedValue: isToken0Price ? position.priceLower : position?.priceUpper?.invert(),
            rightTypedValue: isToken0Price ? position.priceUpper : position?.priceLower?.invert(),
          })
        }

        onFieldAInput(position.amountA?.toExact() || '')
      })
      router.replace(
        {
          pathname: router.pathname,
          query: {
            ...router.query,
            currency: [
              position.amountA ? currencyId(position.amountA.currency) : '',
              position.amountB ? currencyId(position.amountB.currency) : '',
              feeAmount ? feeAmount.toString() : '',
            ],
          },
        },
        undefined,
        {
          shallow: true,
        },
      )
      closeModal()
    },
    [closeModal, feeAmount, onBothRangeInput, onFieldAInput, onSetFullRange, router],
  )

  if (!data || !data.length) {
    return null
  }

  const hasFarmApr = positionFarmApr && +positionFarmApr > 0
  const combinedApr = hasFarmApr ? lpApr * 100 + +positionFarmApr : lpApr * 100
  const aprDisplay = combinedApr.toLocaleString(undefined, {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  })

  const AprText = hasFarmApr ? TooltipText : Text

  return (
    <div className={className}>
      <div className="flex items-center space-x-1">
        {showTitle && (
          <span className="text-xs text-on-surface">{hasFarmApr ? t('APR (with farming)') : t('APR')}</span>
        )}
        <div className="flex items-center space-x-1.5 text-on-surface">
          <AprText onClick={() => setOpen(true)}>
            <div className="flex items-center space-x-1.5 text-on-surface font-bold">
              <span>{aprDisplay}%</span>
            </div>
          </AprText>
          <button type="button" onClick={() => setOpen(true)} className="hover:opacity-70">
            <Calculator size={20} className="text-on-surface" />
          </button>
          {showQuestion ? (
            <QuestionHelper
              text={
                <div className="flex flex-col items-start space-y-2 text-sm text-on-surface">
                  {hasFarmApr ? (
                    <p className="font-bold">
                      {t('This position must be staking in farm to apply the combined APR with farming rewards.')}
                    </p>
                  ) : null}

                  <p>
                    {t(
                      'Calculated at the current rates with historical trading volume data, and subject to change based on various external variables.',
                    )}
                  </p>

                  <p>
                    {t(
                      'This figure is provided for your convenience only, and by no means represents guaranteed returns.',
                    )}
                  </p>
                </div>
              }
              placement="top"
            />
          ) : null}
        </div>
      </div>
      <RoiCalculatorModalV2
        allowApply={allowApply}
        isOpen={isOpen}
        onDismiss={closeModal}
        depositAmountInUsd={defaultDepositUsd || depositUsd}
        price={price}
        currencyA={baseCurrency}
        currencyB={quoteCurrency}
        balanceA={currencyBalances[Field.CURRENCY_A]}
        balanceB={currencyBalances[Field.CURRENCY_B]}
        currencyAUsdPrice={currencyAUsdPrice}
        currencyBUsdPrice={currencyBUsdPrice}
        sqrtRatioX96={sqrtRatioX96}
        liquidity={pool?.liquidity}
        feeAmount={feeAmount}
        protocolFee={applyProtocolFee}
        ticks={data}
        volume24H={volume24H ?? 0}
        priceUpper={priceUpper}
        priceLower={priceLower}
        priceSpan={priceSpan}
        onPriceSpanChange={setPriceSpan}
        onApply={onApply}
        isFarm={Boolean(hasFarmApr)}
        cakeAprFactor={positionFarmAprFactor}
        cakePrice={cakePrice.toFixed(3)}
      />
    </div>
  )
}
