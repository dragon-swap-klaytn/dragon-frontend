import { useTranslation } from '@pancakeswap/localization'
import { Currency } from '@pancakeswap/sdk'
import { Position } from '@pancakeswap/v3-sdk'
import FormattedCurrencyAmount from 'components/FormattedCurrencyAmount/FormattedCurrencyAmount'
import { RangePriceSection } from 'components/RangePriceSection'
import { Bound } from 'config/constants/types'
import { useStablecoinPrice } from 'hooks/useBUSDPrice'
import { formatTickPrice } from 'hooks/v3/utils/formatTickPrice'
import { ReactNode, useCallback, useMemo, useState } from 'react'
import { formatPrice } from 'utils/formatCurrencyAmount'
import { unwrappedToken } from 'utils/wrappedCurrency'

import { CurrencyLogoWithAmount, CurrencyLogoWithSymbol, TagV2 } from '@pancakeswap/uikit'
import clsx from 'clsx'
import { RangeTag } from 'components/RangeTag'
import useAccountActiveChain from 'hooks/useAccountActiveChain'
import { useMasterchefV3 } from 'hooks/useContract'
import useTokenPrices from 'hooks/useTokenPrices'
import { useV3TokenIdsByAccount } from 'hooks/v3/useV3Positions'
import { useRouter } from 'next/router'
import { formatDollarAmountV2 } from 'views/Dashboard/utils/numbers'
import RateToggle from './RateToggle'

export const PositionPreview = ({
  position,
  title,
  inRange,
  baseCurrencyDefault,
  ticksAtLimit,
  className,
}: {
  position: Position
  title?: ReactNode
  inRange: boolean
  baseCurrencyDefault?: Currency | undefined
  ticksAtLimit: { [bound: string]: boolean | undefined }
  className?: string
}) => {
  const {
    t,
    i18n: { language: locale },
  } = useTranslation()

  const currency0 = unwrappedToken(position.pool.token0)
  const currency1 = unwrappedToken(position.pool.token1)

  const baseEqualsCurrency0 = baseCurrencyDefault && currency0 && baseCurrencyDefault.equals(currency0)
  const baseEqualsCurrency1 = baseCurrencyDefault && currency1 && baseCurrencyDefault.equals(currency1)

  // track which currency should be base
  const [baseCurrency, setBaseCurrency] = useState(
    baseCurrencyDefault ? (baseEqualsCurrency0 ? currency0 : baseEqualsCurrency1 ? currency1 : currency0) : currency0,
  )

  const sorted = currency0 && baseCurrency?.equals(currency0)
  const quoteCurrency = sorted ? currency1 : currency0

  const price = sorted ? position.pool.priceOf(position.pool.token0) : position.pool.priceOf(position.pool.token1)

  const priceLower = sorted ? position.token0PriceLower : position.token0PriceUpper.invert()
  const priceUpper = sorted ? position.token0PriceUpper : position.token0PriceLower.invert()

  const { prices } = useTokenPrices()
  const { prices: pricesFromSs } = useTokenPrices({ source: 'swapscanner' })

  const price0 = useStablecoinPrice(position.pool.token0 ?? undefined, { enabled: !!position.amount0 })
  const price1 = useStablecoinPrice(position.pool.token1 ?? undefined, { enabled: !!position.amount1 })

  const token0Price = +(
    price0?.toSignificant(6) ||
    prices?.[position.pool.token0.address] ||
    pricesFromSs?.[position.pool.token0.address] ||
    0
  )
  const token1Price = +(
    price1?.toSignificant(6) ||
    prices?.[position.pool.token1.address] ||
    pricesFromSs?.[position.pool.token1.address] ||
    0
  )

  const handleRateChange = useCallback(() => {
    setBaseCurrency(quoteCurrency)
  }, [quoteCurrency])

  const removed = typeof position?.liquidity === 'bigint' && position?.liquidity === 0n

  const router = useRouter()

  const { currency } = router.query
  const tokenId = currency ? currency[currency.length - 1] : undefined

  const { account } = useAccountActiveChain()
  const masterchefV3 = useMasterchefV3()
  const { tokenIds: stakedTokenIds } = useV3TokenIdsByAccount(masterchefV3?.address, account)

  const isStakedInMCv3 = useMemo(
    () => Boolean(tokenId) && Boolean(stakedTokenIds.find((id) => id.toString() === tokenId)),
    [tokenId, stakedTokenIds],
  )

  return (
    <div className={clsx('flex flex-col', className)}>
      <div className="w-full items-center gap-2 flex justify-between flex-wrap">
        <div className="flex flex-col items-start">
          <div className="flex items-center gap-2 flex-wrap">
            <CurrencyLogoWithSymbol
              currencyA={currency0 ?? undefined}
              currencyB={currency1 ?? undefined}
              symbol={`${currency0?.symbol}-${currency1?.symbol}`}
              symbolClassName="font-bold text-on-surface"
            />

            {Boolean(isStakedInMCv3) && <TagV2 color="orange">{t('Boost 🔥')}</TagV2>}
            <RangeTag removed={removed} outOfRange={!inRange} />
          </div>

          <p className="text-sm text-on-surface-subtlest mt-2">
            {tokenId && `V3 LP #${tokenId}`} / {position?.pool?.fee / 10000}% {t('Fee Tier')}
          </p>
        </div>
      </div>

      <div className="flex flex-col mt-8 border-t border-border">
        <CurrencyLogoWithAmount
          className="py-2 border-b border-border"
          currencyA={currency0}
          symbol={currency0?.symbol}
          amount={<FormattedCurrencyAmount currencyAmount={position.amount0} />}
          value={formatDollarAmountV2({
            num: token0Price * (+position.amount0.toSignificant(6) || 0),
            withDollarSign: true,
          })}
        />
        <CurrencyLogoWithAmount
          className="py-2 border-b border-border"
          currencyA={currency1}
          symbol={currency1?.symbol}
          amount={<FormattedCurrencyAmount currencyAmount={position.amount1} />}
          value={formatDollarAmountV2({
            num: token1Price * (+position.amount1.toSignificant(6) || 0),
            withDollarSign: true,
          })}
        />
      </div>

      <div className="flex flex-col items-center mt-8">
        <div className="flex items-center space-x-2 justify-between w-full">
          <span className="text-on-surface-brand text-xs">{title}</span>
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
          titleColor="text-on-surface-brand"
          currency0={quoteCurrency}
          currency1={baseCurrency}
          price={formatPrice(price, 6, locale)}
          className="mt-4"
        />
      </div>
    </div>
  )
}
