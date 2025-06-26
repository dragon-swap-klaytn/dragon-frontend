import { Currency } from '@pancakeswap/swap-sdk-core'
import { ButtonV2, Notification, useModal, useTooltip } from '@pancakeswap/uikit'
import { useUserSlippage } from '@pancakeswap/utils/user'
import { InfoIcon } from '@phosphor-icons/react'
import clsx from 'clsx'
import { SsLogo } from 'components/Vector'
import useSsQuote from 'hooks/use-ss-quote'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import useMaxDepositAmount from 'hooks/useMaxDepositAmount'
import { useTranslation } from 'next-i18next'
import { ConfirmSsSwapModal } from 'views/Swap/Ss/ConfirmSsSwapModal'

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
  const {
    t,
    i18n: { language: locale },
  } = useTranslation()

  const { account } = useActiveWeb3React()

  const { targetRef, tooltip, tooltipVisible } = useTooltip(
    <p className="text-sm break-keep">
      {t('Due to fees and price fluctuations, some tokens may be insufficient or left over even after the swap.')}
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

  const tokenIn = !maxSwapToken ? null : maxSwapToken.type === 'base' ? maxSwapToken.quoteToken : maxSwapToken.baseToken
  const tokenOut = !maxSwapToken
    ? null
    : maxSwapToken.type === 'base'
    ? maxSwapToken.baseToken
    : maxSwapToken.quoteToken

  const amount = !maxSwapToken || !tokenIn ? '0' : maxSwapToken.swapAmount.numerator.toString()
  const [allowedSlippage] = useUserSlippage()
  const { ssQuote, refreshSsQuote, ssQuoteIsLoading } = useSsQuote({
    slippage: allowedSlippage.toString(),
    from: account || '',
    to: account || '',
    tokenInAddress: tokenIn?.address || '',
    tokenOutAddress: tokenOut?.address || '',
    amount,
    enable: !!maxSwapToken,
  })
  const [onPresentConfirmModal] = useModal(
    <ConfirmSsSwapModal quote={ssQuote} refreshQuote={refreshSsQuote} refreshing={!ssQuote || ssQuoteIsLoading} />,
    true,
    true,
    'ConfirmSsSwapModal',
    [ssQuote, ssQuoteIsLoading],
  )

  if (!maxSwapToken) {
    return null
  }

  return (
    <Notification variant="positive" fullWidth className="mt-5">
      <div className="flex items-center space-x-1 mb-2">
        <h4>{t('Want to maximize your token deposit?')}</h4>
        <div ref={targetRef}>
          <InfoIcon />
        </div>

        {tooltipVisible && tooltip}
      </div>
      <p className="mb-2 break-keep">
        {t('To maximize your deposit, you need to swap {{aAmount}} {{aSymbol}} tokens to {{bSymbol}} tokens.', {
          aAmount: maxSwapToken.swapAmount.toFixed(6),
          aSymbol: maxSwapToken.type === 'base' ? maxSwapToken.quoteToken.symbol : maxSwapToken.baseToken.symbol,
          bSymbol: maxSwapToken.type === 'base' ? maxSwapToken.baseToken.symbol : maxSwapToken.quoteToken.symbol,
        })}
      </p>

      <ButtonV2
        scale="xs"
        variant="primary"
        onClick={onPresentConfirmModal}
        className={clsx('my-4 flex items-center gap-1', {
          'flex-row-reverse': locale === 'ko',
        })}
      >
        <span className="font-bold">{t('Swap with')}</span>
        <SsLogo className="inline-block" width={92} />
      </ButtonV2>

      <div className="flex flex-col mb-2">
        <h5>
          <b>{t('Expected deposit amount after the swap')}</b>
        </h5>
        <p>
          ≈&nbsp;
          <b>
            {maxSwapToken.baseToken.amount.toLocaleString(undefined, {
              maximumFractionDigits: 6,
              minimumFractionDigits: 6,
            })}
          </b>
          &nbsp;
          {maxSwapToken.baseToken.symbol} +&nbsp;
          <b>
            {maxSwapToken.quoteToken.amount.toLocaleString(undefined, {
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
