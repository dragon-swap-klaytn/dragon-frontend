import { useTranslation } from '@pancakeswap/localization'
import { TagV2 } from '@pancakeswap/uikit'

import { Bound } from '@pancakeswap/widgets-internal'
import { ArrowsLeftRight } from '@phosphor-icons/react'
import clsx from 'clsx'
import { PortfolioPositionBigInt, PortfolioV3DataBigInt } from 'hooks/use-portfolio'
import useTokenPrices from 'hooks/use-token-prices'
import { useDerivedPositionInfoV2 } from 'hooks/v3/useDerivedPositionInfoV2'
import useIsTickAtLimit from 'hooks/v3/useIsTickAtLimit'
import { formatTickPrice } from 'hooks/v3/utils/formatTickPrice'
import { TokenSimple } from 'lib/graph-queries/types'
import { PortfolioV2Data } from 'pages/api/portfolio'
import { useMemo, useState } from 'react'
import { formatDollarAmountV2 } from 'views/Dashboard/utils/numbers'

export default function PositionCardList({
  className,
  token0,
  token1,
  userData,
  poolFeeTier,
}: {
  className?: string
  token0: TokenSimple
  token1: TokenSimple
  userData: PortfolioV3DataBigInt | PortfolioV2Data
  poolFeeTier: number
}) {
  return (
    <div className={clsx('flex flex-col items-center space-y-3', className)}>
      {userData.type === 'v3' ? (
        (userData as PortfolioV3DataBigInt).positions.map((position) => (
          <PositionCard
            key={`${userData.poolId}:position:${position.positionId}`}
            token0={token0}
            token1={token1}
            position={position}
            poolFeeTier={poolFeeTier}
          />
        ))
      ) : (
        <></>
      )}
    </div>
  )
}

export function PositionCard({
  token0,
  token1,
  position,
  poolFeeTier,
}: {
  token0: TokenSimple
  token1: TokenSimple
  position: PortfolioPositionBigInt
  poolFeeTier: number
}) {
  const { prices } = useTokenPrices()
  // use swapscanner price as fallback
  const { prices: ssPrices } = useTokenPrices({ source: 'swapscanner' })

  const {
    t,
    currentLanguage: { locale },
  } = useTranslation()

  const token0USD = useMemo(() => {
    const price0 = prices?.[position.token0.address] ?? ssPrices?.[position.token0.address] ?? 0

    return {
      deposited: position.token0.amount * price0,
      fee: position.token0.feeAmount * price0,
    }
  }, [position.token0.address, position.token0.feeAmount, prices, ssPrices, position.token0.amount])

  const token1USD = useMemo(() => {
    const price1 = prices?.[position.token1.address] ?? ssPrices?.[position.token1.address] ?? 0

    return {
      deposited: position.token1.amount * price1,
      fee: position.token1.feeAmount * price1,
    }
  }, [position.token1.address, position.token1.feeAmount, prices, ssPrices, position.token1.amount])

  const rewardsUSD = useMemo(() => {
    if (!position.rewards) return 0

    return position.rewards.reduce((acc, reward) => {
      const price = prices?.[reward.address] ?? ssPrices?.[reward.address] ?? 0

      return acc + reward.amount * price
    }, 0)
  }, [position.rewards, prices, ssPrices])

  const { position: _position } = useDerivedPositionInfoV2(position, poolFeeTier)
  const { tickLower, tickUpper } = _position ?? {}
  const tickAtLimit = useIsTickAtLimit(poolFeeTier, tickLower, tickUpper)
  const [inverted, setInverted] = useState(false)

  const priceLower = useMemo(() => {
    if (!_position) return null
    if (!token0 || !token1) return null

    return inverted ? _position.token0PriceLower : _position.token0PriceUpper.invert()
  }, [inverted, token0, token1, _position])

  const priceUpper = useMemo(() => {
    if (!_position) return null
    if (!token0 || !token1) return null

    return inverted ? _position.token0PriceUpper : _position.token0PriceLower.invert()
  }, [_position, inverted, token0, token1])

  if (!position) return null

  return (
    <div className="p-5 rounded-xl flex flex-col items-start space-y-5 bg-neutral-dark w-full">
      <div className="flex flex-col items-start space-y-2">
        <div className="flex items-center space-x-2">
          <h5 className="text-on-surface">{`${token0.symbol}/${token1.symbol}`}</h5>
          <span className="text-[13px] text-on-surface-subtlest">#{position.positionId}</span>
        </div>

        <TagV2 className="min-w-8" color={position.isOutOfBounds ? 'red' : 'green'}>
          {position.isOutOfBounds ? t('Out of range') : 'In range'}
        </TagV2>
      </div>

      <div className="flex flex-wrap items-end gap-2">
        <div className="flex flex-col items-start w-[100px]">
          <span className="text-sm text-on-surface">
            {formatDollarAmountV2({
              num: token0USD.deposited + token1USD.deposited,
              withDollarSign: true,
            })}
          </span>
          <span className="text-xs text-on-surface-subtle">{t('Position')}</span>
        </div>
        <div className="flex flex-col items-start w-[100px]">
          <span className="text-sm text-on-surface">
            {formatDollarAmountV2({
              num: token0USD.fee + token1USD.fee,
              withDollarSign: true,
            })}
          </span>
          <span className="text-xs text-on-surface-subtle">{t('Fees')}</span>
        </div>
        <div className="flex flex-col items-start w-[100px]">
          {/* <FarmV3ApyButton farm={farm} position={position} isPositionStaked={position.isStaked} /> */}

          <span className="text-xs text-on-surface-subtle">{t('APY')}</span>
        </div>

        {!!(priceLower && priceUpper) && (
          <div className="flex flex-col items-start w-[220px]">
            <div className="text-xs text-on-surface-subtle flex flex-wrap items-center gap-1 mt-1">
              <span className="inline-block w-7">Min:</span>
              <span className="text-[13px] text-on-surface">
                {formatTickPrice(priceLower, tickAtLimit, Bound.LOWER, locale)}
              </span>

              <div className="flex items-center space-x-1">
                <span className="text-on-surface text-xs">
                  {!inverted ? `${token0.symbol}/${token1.symbol}` : `${token1.symbol}/${token0.symbol}`}
                </span>

                <button
                  type="button"
                  className="hover:opacity-70 text-on-surface-subtle"
                  onClick={() => setInverted(!inverted)}
                >
                  <ArrowsLeftRight />
                </button>
              </div>
            </div>

            <div className="text-xs text-on-surface-subtle flex flex-wrap items-center gap-1">
              <span className="inline-block w-7">Max:</span>
              <span className="text-[13px] text-on-surface">
                {formatTickPrice(priceUpper, tickAtLimit, Bound.UPPER, locale)}
              </span>

              <div className="flex items-center space-x-1">
                <span className="text-on-surface text-xs">
                  {!inverted ? `${token0.symbol}/${token1.symbol}` : `${token1.symbol}/${token0.symbol}`}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col items-start w-[100px]">
          <span className="text-sm text-on-surface-brand">
            {formatDollarAmountV2({
              num: rewardsUSD,
              withDollarSign: true,
            })}
          </span>

          <span className="text-xs text-on-surface-subtle">{t('Rewards')}</span>
        </div>
      </div>
    </div>
  )
}
