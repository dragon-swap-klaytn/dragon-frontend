import { useTranslation } from '@pancakeswap/localization'
import { Currency, CurrencyAmount, TradeType } from '@pancakeswap/sdk'
import { formatAmount } from '@pancakeswap/utils/formatFractions'
import truncateHash from '@pancakeswap/utils/truncateHash'
import { ArrowCircleDown } from '@phosphor-icons/react'
import Button from 'components/Common/Button'
import Notification from 'components/Common/Notification'
import TruncatedText from 'components/Common/TruncatedText'
import { CurrencyLogo } from 'components/Logo'
import { useMemo } from 'react'
import { Field } from 'state/swap/actions'

export default function SwapModalHeader({
  inputAmount,
  outputAmount,
  tradeType,
  currencyBalances,
  slippageAdjustedAmounts,
  isEnoughInputBalance,
  recipient,
  showAcceptChanges,
  onAcceptChanges,
}: {
  inputAmount: CurrencyAmount<Currency>
  outputAmount: CurrencyAmount<Currency>
  currencyBalances: {
    INPUT?: CurrencyAmount<Currency>
    OUTPUT?: CurrencyAmount<Currency>
  }
  tradeType: TradeType
  slippageAdjustedAmounts: { [field in Field]?: CurrencyAmount<Currency> }
  isEnoughInputBalance?: boolean
  recipient?: string
  showAcceptChanges: boolean
  onAcceptChanges: () => void
}) {
  const { t } = useTranslation()

  const amount =
    tradeType === TradeType.EXACT_INPUT
      ? formatAmount(slippageAdjustedAmounts[Field.OUTPUT], 6)
      : formatAmount(slippageAdjustedAmounts[Field.INPUT], 6)
  const symbol = tradeType === TradeType.EXACT_INPUT ? outputAmount.currency.symbol : inputAmount.currency.symbol

  const tradeInfoText = useMemo(() => {
    return tradeType === TradeType.EXACT_INPUT
      ? t('Output is estimated. You will receive at least %amount% %symbol% or the transaction will revert.', {
          amount: `${amount}`,
          symbol,
        })
      : t('Input is estimated. You will sell at most %amount% %symbol% or the transaction will revert.', {
          amount: `${amount}`,
          symbol,
        })
  }, [t, tradeType, amount, symbol])

  const truncatedRecipient = recipient ? truncateHash(recipient) : ''

  const recipientInfoText = t('Output will be sent to %recipient%', {
    recipient: truncatedRecipient,
  })

  const [recipientSentToText, postSentToText] = recipientInfoText.split(truncatedRecipient)

  return (
    <div className="flex flex-col items-center">
      <div className="flex flex-col items-center space-y-3 w-full">
        <TokenAmountRow amount={inputAmount} currency={currencyBalances.INPUT?.currency ?? inputAmount.currency} />
        <ArrowCircleDown size={24} className="text-gray-50" />
        <TokenAmountRow amount={outputAmount} currency={currencyBalances.OUTPUT?.currency ?? outputAmount.currency} />
      </div>

      {showAcceptChanges ? (
        <div className="py-4 px-6 w-full rounded-[20px] bg-surface-container-highest mt-4">
          <p className="text-sm text-center text-on-surface-primary">{t('Update with a new quote?')}</p>

          <Button variant="primary" fullWidth onClick={onAcceptChanges} scale="sm" className="mt-4">
            {t('Accept')}
          </Button>
        </div>
      ) : null}

      {tradeType === TradeType.EXACT_OUTPUT && !isEnoughInputBalance && (
        <Notification variant="warning" className="mt-4 w-full">
          <p>{t('Insufficient input token balance. Your transaction may fail.')}</p>
        </Notification>
      )}

      <p className="text-center text-on-surface-primary tetx-sm mt-4">{tradeInfoText}</p>

      {recipient ? (
        <div className="flex flex-col space-y-3 mt-4 bg-surface-container-highest">
          {recipientSentToText}
          <b title={recipient}>{truncatedRecipient}</b>
          {postSentToText}
        </div>
      ) : null}
    </div>
  )
}

function TokenAmountRow({ amount, currency }: { amount: CurrencyAmount<Currency>; currency: Currency }) {
  return (
    <div className="flex items-center space-x-2 text-sm justify-between w-full rounded-[20px] p-2 bg-surface-container-highest text-on-surface-primary">
      <div className="flex items-center space-x-2">
        <CurrencyLogo currency={currency ?? amount.currency} size={28} />
        <span>{amount.currency.symbol}</span>
      </div>

      <TruncatedText className="font-bold text-lg text-right pr-2">{formatAmount(amount, 6)}</TruncatedText>
    </div>
  )
}
