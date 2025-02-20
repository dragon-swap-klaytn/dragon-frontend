import { useTranslation } from '@pancakeswap/localization'
import { Currency, CurrencyAmount, Fraction, Percent, Token } from '@pancakeswap/sdk'
import { ButtonV2, InjectedModalProps } from '@pancakeswap/uikit'
import { ConfirmationModalContent } from '@pancakeswap/widgets-internal'
import TransactionConfirmationModal from 'components/TransactionConfirmationModal'
import React from 'react'
import { Field } from 'state/burn/actions'
import { AddLiquidityModalHeader, PairDistribution } from './common'

interface ConfirmAddLiquidityModalProps {
  title: string
  customOnDismiss: () => void
  attemptingTxn: boolean
  hash?: string
  pendingText: string
  currencies: { [field in Field]?: Currency }
  noLiquidity?: boolean
  allowedSlippage: number
  liquidityErrorMessage?: string
  price?: Fraction
  parsedAmounts: { [field in Field]?: CurrencyAmount<Currency> }
  onAdd: () => void
  poolTokenPercentage?: Percent
  liquidityMinted?: CurrencyAmount<Token>
  currencyToAdd?: Token
}

const ConfirmAddLiquidityModal: React.FC<
  React.PropsWithChildren<InjectedModalProps & ConfirmAddLiquidityModalProps>
> = ({
  title,
  onDismiss,
  customOnDismiss,
  attemptingTxn,
  hash,
  pendingText,
  price,
  currencies,
  noLiquidity,
  allowedSlippage,
  parsedAmounts,
  liquidityErrorMessage,
  onAdd,
  poolTokenPercentage,
  liquidityMinted,
  currencyToAdd,
}) => {
  const { t } = useTranslation()

  return (
    <TransactionConfirmationModal
      title={title}
      onDismiss={onDismiss}
      customOnDismiss={customOnDismiss}
      attemptingTxn={attemptingTxn}
      currencyToAdd={currencyToAdd}
      errorMessage={liquidityErrorMessage}
      hash={hash}
      content={
        <ConfirmationModalContent
          topContent={
            <AddLiquidityModalHeader
              allowedSlippage={allowedSlippage}
              currencies={currencies}
              liquidityMinted={liquidityMinted}
              poolTokenPercentage={poolTokenPercentage}
              price={price}
              noLiquidity={noLiquidity}
            >
              <PairDistribution
                title={t('Input')}
                currencyA={currencies[Field.CURRENCY_A]}
                currencyAValue={parsedAmounts[Field.CURRENCY_A]?.toSignificant(6)}
                currencyB={currencies[Field.CURRENCY_B]}
                currencyBValue={parsedAmounts[Field.CURRENCY_B]?.toSignificant(6)}
              />
            </AddLiquidityModalHeader>
          }
          bottomContent={
            <ButtonV2 variant="primary" onClick={onAdd} className="mt-6" fullWidth>
              {noLiquidity ? t('Create Pair & Supply') : t('Confirm Supply')}
            </ButtonV2>
          }
        />
      }
      pendingText={pendingText}
    />
  )
}

export default ConfirmAddLiquidityModal
