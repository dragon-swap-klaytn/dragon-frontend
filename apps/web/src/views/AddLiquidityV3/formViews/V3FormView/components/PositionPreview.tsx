import { useTranslation } from '@pancakeswap/localization'
import { Currency } from '@pancakeswap/sdk'
import { Position } from '@pancakeswap/v3-sdk'
import FormattedCurrencyAmount from 'components/FormattedCurrencyAmount/FormattedCurrencyAmount'
import { DoubleCurrencyLogo } from 'components/Logo'
import CurrencyLogo from 'components/Logo/CurrencyLogo'
import { RangePriceSection } from 'components/RangePriceSection'
import { Bound } from 'config/constants/types'
import { useStablecoinPrice } from 'hooks/useBUSDPrice'
import { formatTickPrice } from 'hooks/v3/utils/formatTickPrice'
import { ReactNode, useCallback, useState } from 'react'
import { formatPrice } from 'utils/formatCurrencyAmount'
import { unwrappedToken } from 'utils/wrappedCurrency'

import { RangeTag } from 'components/RangeTag'
import RateToggle from './RateToggle'

export const PositionPreview = ({
  position,
  title,
  inRange,
  baseCurrencyDefault,
  ticksAtLimit,
}: {
  position: Position
  title?: ReactNode
  inRange: boolean
  baseCurrencyDefault?: Currency | undefined
  ticksAtLimit: { [bound: string]: boolean | undefined }
}) => {
  const {
    t,
    currentLanguage: { locale },
  } = useTranslation()

  const currency0 = unwrappedToken(position.pool.token0)
  const currency1 = unwrappedToken(position.pool.token1)

  // track which currency should be base
  const [baseCurrency, setBaseCurrency] = useState(
    baseCurrencyDefault
      ? baseCurrencyDefault === currency0
        ? currency0
        : baseCurrencyDefault === currency1
        ? currency1
        : currency0
      : currency0,
  )

  const sorted = baseCurrency === currency0
  const quoteCurrency = sorted ? currency1 : currency0

  const price = sorted ? position.pool.priceOf(position.pool.token0) : position.pool.priceOf(position.pool.token1)

  const priceLower = sorted ? position.token0PriceLower : position.token0PriceUpper.invert()
  const priceUpper = sorted ? position.token0PriceUpper : position.token0PriceLower.invert()

  const price0 = useStablecoinPrice(position.pool.token0 ?? undefined, { enabled: !!position.amount0 })
  const price1 = useStablecoinPrice(position.pool.token1 ?? undefined, { enabled: !!position.amount1 })

  const handleRateChange = useCallback(() => {
    setBaseCurrency(quoteCurrency)
  }, [quoteCurrency])

  const removed = typeof position?.liquidity === 'bigint' && position?.liquidity === 0n

  return (
    <div className="flex flex-col space-y-3">
      <div className="flex items-center w-full space-x2 justify-between">
        <div className="flex items-center space-x-3">
          <DoubleCurrencyLogo currency0={currency0 ?? undefined} currency1={currency1 ?? undefined} size={24} />

          <span className="font-bold text-on-surface-primary">
            {currency0?.symbol}-{currency1?.symbol}
          </span>
        </div>

        <RangeTag removed={removed} outOfRange={!inRange} />
      </div>

      <div className="flex flex-col rounded-2xl p-4 bg-surface-container-highest space-y-3">
        <div className="flex items-center space-x-2 w-full justify-between">
          <div className="flex items-center space-x-2">
            <CurrencyLogo currency={currency0} />

            <span className="text-sm text-on-surface-primary">{currency0?.symbol}</span>
          </div>

          <div className="flex flex-col items-end">
            <p className="text-sm text-on-surface-primary">
              <FormattedCurrencyAmount currencyAmount={position.amount0} />
            </p>

            <p className="text-[13px] text-on-surface-tertiary">
              {position.amount0 && price0
                ? `~$${price0.quote(position.amount0?.wrapped).toFixed(2, { groupSeparator: ',' })}`
                : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 w-full justify-between">
          <div className="flex items-center space-x-2">
            <CurrencyLogo currency={currency1} />

            <span className="text-sm text-on-surface-primary">{currency1?.symbol}</span>
          </div>

          <div className="flex flex-col items-end">
            <p className="text-sm text-on-surface-primary">
              <FormattedCurrencyAmount currencyAmount={position.amount1} />
            </p>

            <p className="text-[13px] text-on-surface-tertiary">
              {position.amount1 && price1
                ? `~$${price1.quote(position.amount1?.wrapped).toFixed(2, { groupSeparator: ',' })}`
                : ''}
            </p>
          </div>
        </div>

        <div className="border w-full bg-on-surface-tertiary" />

        <div className="w-full flex items-center space-x-2 justify-between text-sm text-on-surface-primary">
          <h4>{t('Fee Tier')}</h4>

          <span>{position?.pool?.fee / 10000}%</span>
        </div>
      </div>

      <div className="flex flex-col items-center">
        <div className="flex items-center space-x-2 justify-between w-full">
          {title && <span className="text-surface-orange text-xs">{title}</span>}
          <RateToggle currencyA={sorted ? currency0 : currency1} handleRateToggle={handleRateChange} />
        </div>

        <div className="flex items-center space-x-4 w-full mt-2">
          <RangePriceSection
            width="48%"
            title={t('Min Price')}
            currency0={quoteCurrency}
            currency1={baseCurrency}
            price={formatTickPrice(priceLower, ticksAtLimit, Bound.LOWER, locale)}
          />
          <RangePriceSection
            width="48%"
            title={t('Max Price')}
            currency0={quoteCurrency}
            currency1={baseCurrency}
            price={formatTickPrice(priceUpper, ticksAtLimit, Bound.UPPER, locale)}
          />
        </div>
        <RangePriceSection
          title={t('Current Price')}
          currency0={quoteCurrency}
          currency1={baseCurrency}
          price={formatPrice(price, 6, locale)}
          className="mt-4"
        />
      </div>
    </div>
  )
}
