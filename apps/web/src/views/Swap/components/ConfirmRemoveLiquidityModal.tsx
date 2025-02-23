import { Currency, CurrencyAmount, Percent, Token } from '@pancakeswap/sdk'
import { ButtonV2, ContainerV2, CurrencyLogoWithAmount, InjectedModalProps } from '@pancakeswap/uikit'
import { ConfirmationModalContent } from '@pancakeswap/widgets-internal'
import React from 'react'

import { useTranslation } from '@pancakeswap/localization'
import TransactionConfirmationModal from 'components/TransactionConfirmationModal'
import { ApprovalState } from 'hooks/useApproveCallback'
import { Field } from 'state/burn/actions'

interface ConfirmRemoveLiquidityModalProps {
  title: string
  customOnDismiss: () => void
  attemptingTxn: boolean
  hash: string
  pendingText: string
  parsedAmounts: {
    [Field.LIQUIDITY_PERCENT]: Percent
    [Field.LIQUIDITY]?: CurrencyAmount<Token>
    [Field.CURRENCY_A]?: CurrencyAmount<Currency>
    [Field.CURRENCY_B]?: CurrencyAmount<Currency>
  }
  allowedSlippage: number
  onRemove: () => void
  liquidityErrorMessage?: string
  approval: ApprovalState
  signatureData?: any
  currencyA?: Currency
  currencyB?: Currency
}

const ConfirmRemoveLiquidityModal: React.FC<
  React.PropsWithChildren<InjectedModalProps & ConfirmRemoveLiquidityModalProps>
> = ({
  title,
  onDismiss,
  customOnDismiss,
  attemptingTxn,
  hash,
  approval,
  signatureData,
  pendingText,
  parsedAmounts,
  allowedSlippage,
  onRemove,
  liquidityErrorMessage,
  currencyA,
  currencyB,
}) => {
  const { t } = useTranslation()

  return (
    <TransactionConfirmationModal
      title={title}
      onDismiss={onDismiss}
      customOnDismiss={customOnDismiss}
      attemptingTxn={attemptingTxn}
      hash={hash}
      errorMessage={liquidityErrorMessage}
      content={
        <ConfirmationModalContent
          topContent={
            <>
              <ContainerV2>
                {parsedAmounts[Field.CURRENCY_A] && (
                  <CurrencyLogoWithAmount
                    currencyA={currencyA}
                    symbol={currencyA?.symbol}
                    amount={parsedAmounts[Field.CURRENCY_A]?.toSignificant(6)}
                    className="pb-3 border-b border-border"
                  />
                )}
                {parsedAmounts[Field.CURRENCY_B] && (
                  <CurrencyLogoWithAmount
                    currencyA={currencyB}
                    symbol={currencyB?.symbol}
                    amount={parsedAmounts[Field.CURRENCY_B]?.toSignificant(6)}
                    className="pt-3"
                  />
                )}
              </ContainerV2>

              <p className="text-sm text-on-surface mt-2 text-center break-keep">
                {t(
                  'Output is estimated. If the price changes by more than {{slippage}}% your transaction will revert.',
                  {
                    slippage: allowedSlippage / 100,
                  },
                )}
              </p>
            </>
          }
          bottomContent={
            <ButtonV2
              variant="primary"
              fullWidth
              className="mt-4"
              disabled={!(approval === ApprovalState.APPROVED || signatureData !== null)}
              onClick={onRemove}
            >
              {t('Confirm')}
            </ButtonV2>
          }
        />
      }
      pendingText={pendingText}
    />
  )
}

export default ConfirmRemoveLiquidityModal
