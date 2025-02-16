import { useTranslation } from '@pancakeswap/localization'
import { ERC20Token } from '@pancakeswap/sdk'
import { TagV2 } from '@pancakeswap/uikit'
import { Bound } from '@pancakeswap/widgets-internal'
import { ArrowsLeftRight } from '@phosphor-icons/react'
import { useCurrency } from 'hooks/Tokens'
import { PortfolioPositionBigInt } from 'hooks/use-portfolio'
import { useDerivedPositionInfoV2 } from 'hooks/v3/useDerivedPositionInfoV2'
import useIsTickAtLimit from 'hooks/v3/useIsTickAtLimit'
import { formatTickPrice } from 'hooks/v3/utils/formatTickPrice'
import { useMemo, useState } from 'react'
import { toChecksumToken } from 'utils/toChecksumToken'
import { formatDollarAmount } from 'views/Dashboard/utils/numbers'
import { FarmV3ApyButton } from 'views/PoolsV2/components/FarmCard/V3/FarmV3ApyButton'
import { V3Farm } from 'views/PoolsV2/FarmsV3'

export default function PositionCard({
  farm,
  poolSymbol,
  position,
}: {
  farm: V3Farm
  poolSymbol: string
  position: PortfolioPositionBigInt
}) {
  const {
    t,
    currentLanguage: { locale },
  } = useTranslation()
  const token0FeeUSD = useMemo(() => {
    const currencyAUsdPrice = +farm.tokenPriceBusd
    return position.token0.feeAmount * currencyAUsdPrice
  }, [farm.tokenPriceBusd, position.token0.feeAmount])

  const token1FeeUSD = useMemo(() => {
    const currencyBUsdPrice = +farm.quoteTokenPriceBusd
    return position.token1.feeAmount * currencyBUsdPrice
  }, [farm.quoteTokenPriceBusd, position.token1.feeAmount])

  const { position: _position } = useDerivedPositionInfoV2(position, farm.feeAmount)
  const { tickLower, tickUpper } = _position ?? {}
  const tickAtLimit = useIsTickAtLimit(farm.feeAmount, tickLower, tickUpper)
  const [inverted, setInverted] = useState(false)

  const token0 = useCurrency(position.token0.address) as ERC20Token
  const token1 = useCurrency(position.token1.address) as ERC20Token

  const priceLower = useMemo(() => {
    if (!_position) return null
    if (!token0 || !token1) return null

    return farm.token.equals(toChecksumToken(token0))
      ? inverted
        ? _position.token0PriceLower
        : _position.token0PriceUpper.invert()
      : inverted
      ? _position.token0PriceUpper.invert()
      : _position.token0PriceLower
  }, [inverted, token0, token1, farm.token, _position])

  const priceUpper = useMemo(() => {
    if (!_position) return null
    if (!token0 || !token1) return null

    return farm.token.equals(toChecksumToken(token1))
      ? inverted
        ? _position.token0PriceLower.invert()
        : _position.token0PriceUpper
      : inverted
      ? _position.token0PriceUpper
      : _position.token0PriceLower.invert()
  }, [_position, inverted, farm.token, token0, token1])

  if (!position) return null

  return (
    <div className="p-5 rounded-xl flex flex-col items-start space-y-5 bg-neutral-dark w-full">
      <div className="flex flex-col items-start space-y-2">
        <div className="flex items-center space-x-2">
          <h5 className="text-on-surface">{poolSymbol}</h5>
          <span className="text-[13px] text-on-surface-subtlest">#{position.positionId}</span>
        </div>

        <TagV2 className="min-w-8" color={position.isOutOfBounds ? 'red' : 'green'}>
          {position.isOutOfBounds ? t('Out of range') : 'In range'}
        </TagV2>
      </div>

      <div className="flex flex-wrap items-end gap-2">
        <div className="flex flex-col items-start w-[100px]">
          <span className="text-sm text-on-surface">{position.token0.amount.toFixed(6)}</span>
          <span className="text-xs text-on-surface-subtle">{t('Position')}</span>
        </div>
        <div className="flex flex-col items-start w-[100px]">
          <span className="text-sm text-on-surface">{formatDollarAmount(token0FeeUSD + token1FeeUSD)}</span>
          <span className="text-xs text-on-surface-subtle">{t('Fees')}</span>
        </div>
        <div className="flex flex-col items-start w-[100px]">
          <FarmV3ApyButton farm={farm} position={position} isPositionStaked={position.isStaked} />

          <span className="text-xs text-on-surface-subtle">{t('APY')}</span>
        </div>

        {!!(priceLower && priceUpper) && (
          <div className="flex flex-col items-start">
            <div className="flex items-center space-x-1">
              <span className="text-on-surface text-xs">
                {!inverted
                  ? `${farm.token0.symbol}/${farm.token1.symbol}`
                  : `${farm.token1.symbol}/${farm.token0.symbol}`}
              </span>

              <button
                type="button"
                className="hover:opacity-70 text-on-surface-subtle"
                onClick={() => setInverted(!inverted)}
              >
                <ArrowsLeftRight />
              </button>
            </div>

            <div className="text-xs text-on-surface-subtle flex flex-wrap items-center gap-1 mt-2">
              <span className="inline-block w-7">Min:</span>
              <span className="text-[13px] text-on-surface">
                {formatTickPrice(priceLower, tickAtLimit, Bound.LOWER, locale)}
              </span>
            </div>

            <div className="text-xs text-on-surface-subtle flex flex-wrap items-center gap-1">
              <span className="inline-block w-7">Max:</span>
              <span className="text-[13px] text-on-surface">
                {formatTickPrice(priceUpper, tickAtLimit, Bound.UPPER, locale)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
