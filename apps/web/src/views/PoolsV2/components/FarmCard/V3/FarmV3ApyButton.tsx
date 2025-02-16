/* eslint-disable react/jsx-pascal-case */
import { useTranslation } from '@pancakeswap/localization'
import {
  AutoRow,
  Flex,
  RocketIcon,
  Skeleton,
  Text,
  TooltipText,
  useMatchBreakpoints,
  useModalV2,
  useTooltip,
} from '@pancakeswap/uikit'
import { BIG_ZERO } from '@pancakeswap/utils/bigNumber'
import { encodeSqrtRatioX96 } from '@pancakeswap/v3-sdk'
import { FarmWidget } from '@pancakeswap/widgets-internal'
import { RoiCalculatorModalV2, useRoi } from '@pancakeswap/widgets-internal/roi'
import BigNumber from 'bignumber.js'
import { useCakePrice } from 'hooks/useCakePrice'
import { useMemo, useState } from 'react'
import { styled } from 'styled-components'

import { ChainId } from '@pancakeswap/chains'
import { CurrencyAmount, Token } from '@pancakeswap/swap-sdk-core'
import { CAKE_SYMBOL_VIEW } from '@pancakeswap/tokens'
import { Calculator } from '@phosphor-icons/react'
import clsx from 'clsx'
import { Bound } from 'config/constants/types'
import { PortfolioPositionBigInt } from 'hooks/use-portfolio'
import { usePoolAvgInfo } from 'hooks/usePoolAvgInfo'
import { useAllV3Ticks } from 'hooks/v3/usePoolTickData'
import useV3DerivedInfoV2 from 'hooks/v3/useV3DerivedInfoV2'
import { useFarmsV3Public } from 'state/farmsV3/hooks'
import { Field } from 'state/mint/actions'
import LiquidityFormProvider from 'views/AddLiquidityV3/formViews/V3FormView/form/LiquidityFormProvider'
import { useV3FormState } from 'views/AddLiquidityV3/formViews/V3FormView/form/reducer'
import { V3Farm } from 'views/Farms/FarmsV3'
import {
  USER_ESTIMATED_MULTIPLIER,
  useUserPositionInfo,
} from 'views/Farms/components/YieldBooster/hooks/bCakeV3/useBCakeV3Info'
import { BoostStatus, useBoostStatus } from 'views/Farms/components/YieldBooster/hooks/bCakeV3/useBoostStatus'
import { getDisplayApr } from 'views/Farms/components/getDisplayApr'

const ApyLabelContainer = styled(Flex)`
  cursor: pointer;
  &:hover {
    opacity: 0.5;
  }
`

type FarmV3ApyButtonProps = {
  farm: V3Farm
  position?: PortfolioPositionBigInt
  isPositionStaked?: boolean
}

export function FarmV3ApyButton(props: FarmV3ApyButtonProps) {
  return (
    <LiquidityFormProvider>
      <FarmV3ApyButton_ {...props} />
    </LiquidityFormProvider>
  )
}

function FarmV3ApyButton_({ farm, position, isPositionStaked }: FarmV3ApyButtonProps) {
  const { token: baseCurrency, quoteToken: quoteCurrency, feeAmount } = farm
  const positionId = position?.positionId
  const { t } = useTranslation()
  const roiModal = useModalV2()

  const [priceTimeWindow, setPriceTimeWindow] = useState(0)

  const { ticks: data } = useAllV3Ticks(roiModal.isOpen ? baseCurrency : undefined, quoteCurrency, feeAmount)

  const formState = useV3FormState()

  const { pool, ticks, price, pricesAtTicks, currencyBalances, outOfRange } = useV3DerivedInfoV2(
    baseCurrency ?? undefined,
    quoteCurrency ?? undefined,
    feeAmount,
    baseCurrency ?? undefined,
    position,
    formState,
  )

  const cakePrice = useCakePrice()

  const sqrtRatioX96 = price && encodeSqrtRatioX96(price.numerator, price.denominator)
  const { [Bound.LOWER]: tickLower, [Bound.UPPER]: tickUpper } = ticks
  const { [Bound.LOWER]: priceLower, [Bound.UPPER]: priceUpper } = pricesAtTicks

  const currencyAUsdPrice = +farm.tokenPriceBusd
  const currencyBUsdPrice = +farm.quoteTokenPriceBusd

  const isSorted = farm.token.sortsBefore(farm.quoteToken)

  const { status: boostedStatus } = useBoostStatus(farm.pid, positionId)

  const {
    volumeUSD: volume24H,
    feeUSD,
    tvlUSD,
  } = usePoolAvgInfo({
    address: farm.lpAddress,
    chainId: farm.token.chainId,
  })

  const baseTokenDataInPosition = useMemo(() => {
    if (!position || !baseCurrency) return null

    return {
      address: position.token0.address,
      amount: position.token0.amount,
      currencyAmount: CurrencyAmount.fromRawAmount(
        new Token(ChainId.KLAYTN, position.token0.address, baseCurrency.decimals, baseCurrency.symbol),
        Math.floor(position.token0.amount * 10 ** baseCurrency.decimals),
      ),
    }
  }, [position, baseCurrency])

  const quoteTokenDataInPosition = useMemo(() => {
    if (!position || !quoteCurrency) return null

    return {
      address: position.token1.address,
      amount: position.token1.amount,
      currencyAmount: CurrencyAmount.fromRawAmount(
        new Token(ChainId.KLAYTN, position.token1.address, quoteCurrency.decimals, quoteCurrency.symbol),
        Math.floor(position.token1.amount * 10 ** quoteCurrency.decimals),
      ),
    }
  }, [position, quoteCurrency])

  const balanceA = baseTokenDataInPosition?.currencyAmount ?? currencyBalances[Field.CURRENCY_A]
  const balanceB = quoteTokenDataInPosition?.currencyAmount ?? currencyBalances[Field.CURRENCY_B]

  const globalLpApr = useMemo(() => (tvlUSD ? (100 * feeUSD * 365) / tvlUSD : 0), [feeUSD, tvlUSD])

  const depositUsdAsBN = useMemo(
    () =>
      balanceA &&
      balanceB &&
      currencyAUsdPrice &&
      currencyBUsdPrice &&
      new BigNumber(balanceA.toExact())
        .times(currencyAUsdPrice)
        .plus(new BigNumber(balanceA.toExact()).times(currencyBUsdPrice)),
    [balanceA, balanceB, currencyAUsdPrice, currencyBUsdPrice],
  )

  const { data: farmV3 } = useFarmsV3Public()

  const cakeAprFactor = useMemo(
    () =>
      new BigNumber(farm.poolWeight)
        .times(farmV3.cakePerSecond)
        .times(365 * 60 * 60 * 24)
        .times(cakePrice)
        .div(
          new BigNumber(farm.lmPoolLiquidity).plus(
            isPositionStaked ? BIG_ZERO : position?.liquidity?.toString() ?? BIG_ZERO,
          ),
        )
        .times(100),
    [cakePrice, position?.liquidity, farm.lmPoolLiquidity, farm.poolWeight, farmV3.cakePerSecond, isPositionStaked],
  )

  const positionCakeApr = useMemo(
    () =>
      position
        ? outOfRange
          ? 0
          : typeof depositUsdAsBN === 'number' && depositUsdAsBN === 0
          ? 0
          : new BigNumber(position.liquidity.toString())
              .times(cakeAprFactor)
              .div(depositUsdAsBN ?? 0)
              .toNumber()
        : 0,
    [cakeAprFactor, depositUsdAsBN, position, outOfRange],
  )

  const { apr } = useRoi({
    tickLower,
    tickUpper,
    sqrtRatioX96,
    fee: feeAmount,
    mostActiveLiquidity: pool?.liquidity,
    amountA: baseTokenDataInPosition?.currencyAmount,
    amountB: quoteTokenDataInPosition?.currencyAmount,
    compoundOn: false,
    currencyAUsdPrice: isSorted ? currencyAUsdPrice : currencyBUsdPrice,
    currencyBUsdPrice: isSorted ? currencyBUsdPrice : currencyAUsdPrice,
    volume24H,
  })

  const lpApr = position ? +apr.toFixed(2) : globalLpApr
  const cakeApr = +(farm.cakeApr ?? 0)

  const displayApr = getDisplayApr(cakeApr, lpApr)
  const cakeAprDisplay = cakeApr.toFixed(2)
  const positionCakeAprDisplay = positionCakeApr.toFixed(2)
  const lpAprDisplay = lpApr.toFixed(2)
  const { isDesktop } = useMatchBreakpoints()
  const {
    data: { boostMultiplier },
  } = useUserPositionInfo(positionId)

  const estimatedAPR = useMemo(() => {
    return (parseFloat(cakeAprDisplay) * USER_ESTIMATED_MULTIPLIER + parseFloat(lpAprDisplay)).toLocaleString('en-US', {
      maximumFractionDigits: 2,
    })
  }, [cakeAprDisplay, lpAprDisplay])
  const canBoosted = useMemo(() => boostedStatus !== BoostStatus.CanNotBoost, [boostedStatus])
  const isBoosted = useMemo(() => boostedStatus === BoostStatus.Boosted, [boostedStatus])
  const positionDisplayApr = getDisplayApr(+positionCakeApr, lpApr)
  const positionBoostedDisplayApr = getDisplayApr(boostMultiplier * positionCakeApr, lpApr)

  const aprTooltip = useTooltip(
    <>
      <Text>
        {t('Combined APR')}: <b>{canBoosted ? estimatedAPR : displayApr}%</b>
      </Text>
      <ul>
        <li>
          {t('Farm APR')}:{' '}
          <b>
            {canBoosted && <>{parseFloat(cakeAprDisplay) * USER_ESTIMATED_MULTIPLIER}% </>}
            <span className="text-on-surface">{cakeAprDisplay}%</span>
          </b>
        </li>
        <li>
          <span className="text-on-surface">
            {t('LP Fee APR')}: <b>{lpAprDisplay}%</b>
          </span>
        </li>
      </ul>
      <br />
      <Text>
        {t('Calculated using the total active liquidity staked versus the %symbol% reward emissions for the farm.', {
          symbol: CAKE_SYMBOL_VIEW,
        })}
      </Text>
      {canBoosted && (
        <Text mt="15px">
          {t('bCAKE only boosts Farm APR. Actual boost multiplier is subject to farm and pool conditions.')}
        </Text>
      )}
      <Text mt="15px">{t('APRs for individual positions may vary depending on the configs.')}</Text>
    </>,
  )
  const positionAprTooltip = useTooltip(
    <>
      <span className="text-on-surface">
        {t('Combined APR')}: <b>{isBoosted ? positionBoostedDisplayApr : positionDisplayApr}%</b>
      </span>
      <ul>
        <li>
          {t('Farm APR')}:{' '}
          <b>
            {isBoosted && <>{(positionCakeApr * boostMultiplier).toFixed(2)}% </>}
            <Text
              display="inline-block"
              bold={!isBoosted}
              style={{ textDecoration: isBoosted ? 'line-through' : 'none' }}
            >
              {positionCakeAprDisplay}%
            </Text>
          </b>
        </li>
        <li>
          <span className="text-on-surface">
            {t('LP Fee APR')}: <b>{lpAprDisplay}%</b>
          </span>
        </li>
      </ul>
    </>,
  )

  if (farm.multiplier === '0X') {
    return <span className="text-on-surface">0%</span>
  }

  if (!displayApr) {
    return <Skeleton height={24} width={80} style={{ borderRadius: '12px' }} />
  }

  return (
    <>
      {position ? (
        <AutoRow width="auto" gap="2px">
          <ApyLabelContainer alignItems="center" style={{ textDecoration: 'initial' }} onClick={roiModal.onOpen}>
            {outOfRange ? (
              <span className="text-on-surface">
                {positionCakeApr.toLocaleString('en-US', { maximumFractionDigits: 2 })}%
              </span>
            ) : (
              <>
                <div ref={positionAprTooltip.targetRef}>
                  <div className="flex items-center space-x-2">
                    {isBoosted && (
                      <>
                        {isDesktop && <RocketIcon color="success" />}
                        <span className="bold text-on-surface-brand">{positionBoostedDisplayApr}%</span>
                      </>
                    )}
                    <span
                      className={clsx('text-sm', {
                        'text-on-surface': !isBoosted,
                        'text-on-surface-subtle line-through': isBoosted,
                      })}
                    >
                      {positionDisplayApr}%
                    </span>
                  </div>
                </div>
                {positionAprTooltip.tooltipVisible && positionAprTooltip.tooltip}
              </>
            )}

            <Calculator className="text-on-surface-subtle ml-1" />
          </ApyLabelContainer>
        </AutoRow>
      ) : (
        <>
          <FarmWidget.FarmApyButton
            variant="text-and-button"
            handleClickButton={(e) => {
              e.stopPropagation()
              e.preventDefault()
              roiModal.onOpen()
            }}
          >
            <TooltipText ref={aprTooltip.targetRef} decorationColor="secondary">
              <Flex ml="4px" mr="5px" style={{ gap: 5 }}>
                {canBoosted && (
                  <>
                    {isDesktop && <RocketIcon color="success" />}
                    <span className="text-on-surface">
                      <>
                        <span className="text-on-surface font-bold">{t('Up to')}</span>
                        {`${estimatedAPR}%`}
                      </>
                    </span>
                  </>
                )}
                <span className="text-on-surface" style={{ textDecoration: canBoosted ? 'line-through' : 'none' }}>
                  {displayApr}%
                </span>
              </Flex>
            </TooltipText>
          </FarmWidget.FarmApyButton>
          {aprTooltip.tooltipVisible && aprTooltip.tooltip}
        </>
      )}
      {cakePrice && cakeAprFactor && (
        <RoiCalculatorModalV2
          {...roiModal}
          isFarm
          maxLabel={position ? t('My Position') : undefined}
          closeOnOverlayClick={false}
          depositAmountInUsd={depositUsdAsBN?.toString()}
          max={depositUsdAsBN?.toString()}
          balanceA={balanceA}
          balanceB={balanceB}
          price={price}
          currencyA={baseCurrency}
          currencyB={quoteCurrency}
          currencyAUsdPrice={currencyAUsdPrice}
          currencyBUsdPrice={currencyBUsdPrice}
          sqrtRatioX96={sqrtRatioX96}
          liquidity={pool?.liquidity}
          feeAmount={feeAmount}
          ticks={data}
          volume24H={volume24H}
          priceUpper={priceUpper}
          priceLower={priceLower}
          cakePrice={cakePrice.toFixed(3)}
          cakeAprFactor={cakeAprFactor.times(isBoosted ? boostMultiplier : 1)}
          priceSpan={priceTimeWindow}
          onPriceSpanChange={setPriceTimeWindow}
        />
      )}
    </>
  )
}
