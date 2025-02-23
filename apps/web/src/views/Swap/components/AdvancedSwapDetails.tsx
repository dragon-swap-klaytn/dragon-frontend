import { useTranslation } from '@pancakeswap/localization'
import { Currency, CurrencyAmount, Percent, TradeType } from '@pancakeswap/sdk'
import { formatAmount } from '@pancakeswap/utils/formatFractions'
import { memo, useMemo } from 'react'

import { ExternalLink } from '@pancakeswap/uikit'
import clsx from 'clsx'
import { ONE_BIPS } from 'config/constants/exchange'
import { Field } from 'state/swap/actions'
import { warningSeverity } from 'utils/exchange'
import { DetailContent } from 'views/Swap/V3Swap/containers'

export const TradeSummary = memo(function TradeSummary({
  inputAmount,
  outputAmount,
  tradeType,
  slippageAdjustedAmounts,
  priceImpactWithoutFee,
  realizedLPFee,
}: {
  hasStablePair?: boolean
  inputAmount?: CurrencyAmount<Currency>
  outputAmount?: CurrencyAmount<Currency>
  tradeType?: TradeType
  slippageAdjustedAmounts?: {
    INPUT?: CurrencyAmount<Currency>
    OUTPUT?: CurrencyAmount<Currency>
  }
  priceImpactWithoutFee?: Percent | null
  realizedLPFee?: CurrencyAmount<Currency> | null
}) {
  const { t } = useTranslation()
  const isExactIn = tradeType === TradeType.EXACT_INPUT

  const severity = useMemo(() => warningSeverity(priceImpactWithoutFee), [priceImpactWithoutFee])

  return (
    <div className="flex flex-col space-y-2">
      <DetailContent
        title={isExactIn ? t('Minimum received') : t('Maximum sold')}
        questionHelperText={t(
          'Your transaction will revert if there is a large, unfavorable price movement before it is confirmed.',
        )}
        content={
          <span className="text-on-surface">
            {isExactIn
              ? `${formatAmount(slippageAdjustedAmounts?.[Field.OUTPUT], 4)} ${
                  outputAmount?.currency?.symbol
                }`.trim() || '-'
              : `${formatAmount(slippageAdjustedAmounts?.[Field.INPUT], 4)} ${inputAmount?.currency?.symbol}`.trim() ||
                '-'}
          </span>
        }
      />

      {priceImpactWithoutFee && (
        <DetailContent
          title={t('Price Impact')}
          questionHelperText={
            <div className="text-sm">
              <p>
                <b>{t('AMM')}</b>: {t('The difference between the market price and estimated price due to trade size.')}
              </p>
            </div>
          }
          content={
            <span
              className={clsx({
                'text-red-400': severity === 2 || severity === 3 || severity === 4,
                'text-on-surface': severity < 2,
              })}
            >
              {priceImpactWithoutFee
                ? priceImpactWithoutFee.lessThan(ONE_BIPS)
                  ? '<0.01%'
                  : `${priceImpactWithoutFee.toFixed(2)}%`
                : '-'}
            </span>
          }
        />
      )}

      {realizedLPFee && (
        <DetailContent
          title={t('Trading Fee')}
          questionHelperText={
            <div className="text-sm">
              <p>
                {t(
                  'Fee ranging from 0.1% to 0.01% depending on the pool fee tier. You can check the fee tier by clicking the magnifier icon under the “Route” section.',
                )}
              </p>
              <ExternalLink href="https://docs.dgswap.io/products/fees" className="mt-4">
                {t('Fee Breakdown and Tokenomics')}
              </ExternalLink>
            </div>
          }
          content={
            <span className="text-on-surface">{`${formatAmount(realizedLPFee, 4)} ${
              inputAmount?.currency?.symbol
            }`}</span>
          }
        />
      )}
    </div>
  )
})
