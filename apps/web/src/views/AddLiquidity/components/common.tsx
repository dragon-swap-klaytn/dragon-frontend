import { useTranslation } from '@pancakeswap/localization'
import { Currency, CurrencyAmount, Fraction, Percent, Token } from '@pancakeswap/sdk'
import { Container, CurrencyLogoWithAmount, useTooltip } from '@pancakeswap/uikit'
import React from 'react'
import { Field } from 'state/burn/actions'
import { getLPSymbol } from 'utils/getLpSymbol'
import { SectionTitle } from 'views/AddLiquidityV3'

export const PairDistribution = ({
  title,
  currencyA,
  currencyB,
  currencyAValue,
  currencyBValue,
}: {
  title: React.ReactNode
  currencyA?: Currency
  currencyB?: Currency
  currencyAValue?: string
  currencyBValue?: string
}) => {
  return (
    <div>
      <SectionTitle>{title}</SectionTitle>

      <Container className="mt-2 text-sm text-on-surface-primary">
        {currencyA && (
          <CurrencyLogoWithAmount currencyA={currencyA} symbol={currencyA?.symbol} amount={currencyAValue || '0'} />
        )}

        {currencyB && (
          <CurrencyLogoWithAmount currencyA={currencyB} symbol={currencyB?.symbol} amount={currencyBValue || '0'} />
        )}
      </Container>
    </div>
  )
}

interface AddLiquidityModalHeaderProps {
  currencies: { [field in Field]?: Currency }
  poolTokenPercentage?: Percent
  liquidityMinted?: CurrencyAmount<Token>
  price?: Fraction
  allowedSlippage: number
  children: React.ReactNode
  noLiquidity?: boolean
}

export const AddLiquidityModalHeader = ({
  currencies,
  poolTokenPercentage,
  liquidityMinted,
  price,
  allowedSlippage,
  noLiquidity,
  children,
}: AddLiquidityModalHeaderProps) => {
  const { t } = useTranslation()
  const { tooltip, tooltipVisible, targetRef } = useTooltip(
    t('Output is estimated. If the price changes by more than %slippage%% your transaction will revert.', {
      slippage: allowedSlippage / 100,
    }),
  )

  return (
    <div className="flex flex-col space-y-3">
      {children}

      <div>
        <SectionTitle>{t('You will receive')}</SectionTitle>

        <div className="p-4 rounded-2xl bg-surface-container-highest w-full mt-2">
          <CurrencyLogoWithAmount
            currencyA={currencies[Field.CURRENCY_A]}
            currencyB={currencies[Field.CURRENCY_B]}
            symbol={
              currencies[Field.CURRENCY_A]?.symbol &&
              currencies[Field.CURRENCY_B]?.symbol &&
              getLPSymbol(
                currencies[Field.CURRENCY_A]?.symbol,
                currencies[Field.CURRENCY_B]?.symbol,
                currencies[Field.CURRENCY_A]?.chainId,
              )
            }
            amount={liquidityMinted?.toSignificant(6) || '0'}
          />
        </div>

        <p className="mt-1 px-2 text-sm text-on-surface-secondary">
          {t('Your share in the pair')}: {noLiquidity ? '100' : poolTokenPercentage?.toSignificant(4)}%
        </p>
      </div>

      {!!price && (
        <div className="flex items-center space-x-2 w-full justify-between text-sm text-on-surface-secondary">
          <h5>{t('Rates')}</h5>
          <div className="flex flex-col items-end space-y-1">
            <span>{`1 ${currencies[Field.CURRENCY_A]?.symbol} = ${price?.toSignificant(4)} ${
              currencies[Field.CURRENCY_B]?.symbol
            }`}</span>

            <span>{`1 ${currencies[Field.CURRENCY_B]?.symbol} = ${price?.invert()?.toSignificant(4)} ${
              currencies[Field.CURRENCY_A]?.symbol
            }`}</span>
          </div>
        </div>
      )}
      {!noLiquidity && (
        <div className="flex items-center space-x-2 w-full justify-between text-sm text-on-surface-secondary">
          <h5>{t('Slippage Tolerance')}</h5>
          <span ref={targetRef}>{allowedSlippage / 100}%</span>
          {tooltipVisible && tooltip}
        </div>
      )}
    </div>
  )
}
