import { Currency } from '@pancakeswap/swap-sdk-core'
import { ExternalLink, Notification, useTooltip } from '@pancakeswap/uikit'
import { Info } from '@phosphor-icons/react'
import useMaxDepositAmount from 'hooks/useMaxDepositAmount'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'

export default function MaxDepositAmount({
  base,
  quote,
}: {
  base: {
    currency?: Currency
    amount: number
    maxAmount: number
  }
  quote: {
    currency?: Currency
    amount: number
    maxAmount: number
  }
}) {
  const router = useRouter()
  const { t } = useTranslation()

  const { targetRef, tooltip, tooltipVisible } = useTooltip(
    <p className="text-sm break-keep">
      {t('Due to price fluctuations after the swap, some tokens may be insufficient or left over.')}
    </p>,
    {
      placement: 'bottom',
    },
  )

  const maxSwapToken = useMaxDepositAmount({
    base: {
      currency: base.currency,
      amount: base.amount,
      maxAmount: base.maxAmount,
    },
    quote: {
      currency: quote.currency,
      amount: quote.amount,
      maxAmount: quote.maxAmount,
    },
  })

  if (!maxSwapToken) {
    return null
  }

  return (
    <Notification variant="positive" fullWidth className="mt-5">
      <div className="flex items-center space-x-1 mb-2">
        <h4>{t('Want to maximize your token deposit?')}</h4>
        <div ref={targetRef}>
          <Info />
        </div>

        {tooltipVisible && tooltip}
      </div>
      <p className="mb-2 break-keep">
        {t('To maximize your deposit, you need to swap {{aAmount}} {{aSymbol}} tokens to {{bSymbol}} tokens.', {
          aAmount: maxSwapToken.swapAmount.toLocaleString(undefined, {
            maximumFractionDigits: 6,
            minimumFractionDigits: 6,
          }),
          aSymbol: maxSwapToken.type === 'base' ? maxSwapToken.quoteToken.symbol : maxSwapToken.baseToken.symbol,
          bSymbol: maxSwapToken.type === 'base' ? maxSwapToken.baseToken.symbol : maxSwapToken.quoteToken.symbol,
        })}
      </p>

      <ExternalLink
        className="mb-2"
        href={`https://swapscanner.io${router.locale === 'en' ? '' : '/ko'}/swap?from=${
          maxSwapToken.type === 'base' ? maxSwapToken.quoteToken.address : maxSwapToken.baseToken.address
        }&to=${
          maxSwapToken.type === 'base' ? maxSwapToken.baseToken.address : maxSwapToken.quoteToken.address
        }&amountIn=${maxSwapToken.swapAmount}`}
      >
        {t('Use Swapscanner')}
      </ExternalLink>
      <div className="flex flex-col mb-2">
        <h5>
          <b>{t('Expected deposit amount after the swap')}</b>
        </h5>
        <p>
          ≈&nbsp;
          <b>
            {maxSwapToken.baseToken.tokenAmount.toLocaleString(undefined, {
              maximumFractionDigits: 6,
              minimumFractionDigits: 6,
            })}
          </b>
          &nbsp;
          {maxSwapToken.baseToken.symbol} +&nbsp;
          <b>
            {maxSwapToken.quoteToken.tokenAmount.toLocaleString(undefined, {
              maximumFractionDigits: 6,
              minimumFractionDigits: 6,
            })}
          </b>
          &nbsp;
          {maxSwapToken.quoteToken.symbol}
        </p>
      </div>
    </Notification>
  )
}
