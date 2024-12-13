import { useTranslation } from '@pancakeswap/localization'
import { Currency, CurrencyAmount, Percent, TradeType } from '@pancakeswap/sdk'
import { SmartRouter, SmartRouterTrade } from '@pancakeswap/smart-router/evm'
import { QuestionHelper } from '@pancakeswap/uikit'
import { formatAmount } from '@pancakeswap/utils/formatFractions'
import { CurrencyLogo } from 'components/Logo'
import { memo, PropsWithChildren, ReactElement, ReactNode, useMemo, useState } from 'react'
import { Field } from 'state/swap/actions'
import { basisPointsToPercent, warningSeverity } from 'utils/exchange'

import { ArrowsLeftRight } from '@phosphor-icons/react'
import Button from 'components/Common/Button'
import Notification from 'components/Common/Notification'
import FormattedPriceImpact from '../../components/FormattedPriceImpact'
import { formatExecutionPrice } from '../utils/exchange'

export const SwapModalFooter = memo(function SwapModalFooter({
  priceImpact: priceImpactWithoutFee,
  lpFee: realizedLPFee,
  inputAmount,
  outputAmount,
  trade,
  tradeType,
  slippageAdjustedAmounts,
  isEnoughInputBalance,
  onConfirm,
  swapErrorMessage,
  disabledConfirm,
  currencyBalances,
  allowedSlippage,
}: {
  trade?: SmartRouterTrade<TradeType>
  tradeType: TradeType
  lpFee?: CurrencyAmount<Currency>
  inputAmount: CurrencyAmount<Currency>
  outputAmount: CurrencyAmount<Currency>
  priceImpact?: Percent
  slippageAdjustedAmounts: { [field in Field]?: CurrencyAmount<Currency> }
  isEnoughInputBalance?: boolean
  swapErrorMessage?: string | undefined
  disabledConfirm: boolean
  currencyBalances: {
    INPUT?: CurrencyAmount<Currency>
    OUTPUT?: CurrencyAmount<Currency>
  }
  onConfirm: () => void
  allowedSlippage: number | ReactElement
}) {
  const { t } = useTranslation()
  const [showInverted, setShowInverted] = useState<boolean>(false)
  const severity = warningSeverity(priceImpactWithoutFee)

  const executionPriceDisplay = useMemo(() => {
    const price = SmartRouter.getExecutionPrice(trade) ?? undefined
    return formatExecutionPrice(price, inputAmount, outputAmount, showInverted)
  }, [inputAmount, outputAmount, trade, showInverted])

  return (
    <div className="mt-4">
      <div className="flex flex-col space-y-3 p-4 bg-surface-container-highest rounded-[20px]">
        <SwapModalFooterContainer>
          <SwapModalFooterTitle title={t('Price')} />

          <div className="flex items-center space-x-2 text-sm">
            <span>{executionPriceDisplay}</span>

            <button type="button" onClick={() => setShowInverted(!showInverted)}>
              <ArrowsLeftRight size={16} />
            </button>
          </div>
        </SwapModalFooterContainer>

        <SwapModalFooterContainer>
          <SwapModalFooterTitle title={t('Slippage Tolerance')} />

          <div className="text-sm">
            {typeof allowedSlippage === 'number'
              ? `${basisPointsToPercent(allowedSlippage).toFixed(2)}%`
              : allowedSlippage}
          </div>
        </SwapModalFooterContainer>

        <SwapModalFooterContainer>
          <SwapModalFooterTitle
            title={tradeType === TradeType.EXACT_INPUT ? t('Minimum received') : t('Maximum sold')}
            questionHelperText={t(
              'Your transaction will revert if there is a large, unfavorable price movement before it is confirmed.',
            )}
          />

          <div className="flex items-center space-x-1 text-sm">
            <span>
              {tradeType === TradeType.EXACT_INPUT
                ? formatAmount(slippageAdjustedAmounts[Field.OUTPUT], 4) ?? '-'
                : formatAmount(slippageAdjustedAmounts[Field.INPUT], 4) ?? '-'}
            </span>

            <span>
              {tradeType === TradeType.EXACT_INPUT ? outputAmount.currency.symbol : inputAmount.currency.symbol}
            </span>
          </div>
        </SwapModalFooterContainer>

        <SwapModalFooterContainer>
          <SwapModalFooterTitle
            title={t('Price Impact')}
            questionHelperText={t('The difference between the market price and your price due to trade size.')}
          />

          <FormattedPriceImpact priceImpact={priceImpactWithoutFee} />
        </SwapModalFooterContainer>

        <SwapModalFooterContainer>
          <SwapModalFooterTitle
            title={t('Trading Fee')}
            questionHelperText={
              <div className="text-sm">
                <p>
                  {t(
                    'Fee ranging from 0.1% to 0.01% depending on the pool fee tier. You can check the fee tier by clicking the magnifier icon under the “Route” section.',
                  )}
                </p>

                <a href="https://docs.dgswap.io/products/fees" className="mt-3" target="_blank" rel="noreferrer">
                  {t('Fee Breakdown and Tokenomics')}
                </a>
              </div>
            }
          />

          {realizedLPFee ? (
            <div className="flex items-center space-x-2">
              <span className="text-sm">{`${formatAmount(realizedLPFee, 6)} ${inputAmount.currency.symbol}`}</span>

              <CurrencyLogo currency={currencyBalances.INPUT?.currency ?? inputAmount.currency} size="24px" />
            </div>
          ) : (
            <span className="text-sm">-</span>
          )}
        </SwapModalFooterContainer>
      </div>

      <Button className="mt-3" variant="primary" onClick={onConfirm} disabled={disabledConfirm} fullWidth>
        {severity > 2 || (tradeType === TradeType.EXACT_OUTPUT && !isEnoughInputBalance)
          ? t('Swap Anyway')
          : t('Confirm Swap')}
      </Button>

      {swapErrorMessage ? (
        <Notification className="mt-3" variant="warning">
          {swapErrorMessage}
        </Notification>
      ) : null}
    </div>
  )
})

function SwapModalFooterContainer({ children }: PropsWithChildren) {
  return <div className="flex items-center justify-between">{children}</div>
}

function SwapModalFooterTitle({ title, questionHelperText }: { title: string; questionHelperText?: ReactNode }) {
  return (
    <div className="flex items-center space-x-1">
      <h4 className="text-sm whitespace-nowrap">{title}</h4>
      {questionHelperText && <QuestionHelper text={questionHelperText} placement="top" ml="4px" />}
    </div>
  )
}
