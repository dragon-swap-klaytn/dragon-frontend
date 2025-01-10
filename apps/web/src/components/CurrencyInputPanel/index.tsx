import { useTranslation } from '@pancakeswap/localization'
import { Currency, CurrencyAmount, Pair, Token } from '@pancakeswap/sdk'
import { CurrencyLogoWithSymbol, Loading, NumberFormat, Skeleton, useModal } from '@pancakeswap/uikit'
import { formatAmount } from '@pancakeswap/utils/formatFractions'
import { CurrencyLogo } from '@pancakeswap/widgets-internal'
import { memo, PropsWithChildren, useCallback, useMemo } from 'react'

import { formatNumber } from '@pancakeswap/utils/formatBalance'
import { useStablecoinPriceAmount } from 'hooks/useBUSDPrice'
import { StablePair } from 'views/AddLiquidity/AddStableLiquidity/hooks/useStableLPDerivedMintInfo'

import { CaretDown } from '@phosphor-icons/react'
import clsx from 'clsx'
import { useCurrencyBalance } from 'state/wallet/hooks'
import { ButtonOnClickType } from 'types'
import { useAccount } from 'wagmi'
import CurrencySearchModal from '../SearchModal/CurrencySearchModal'

interface CurrencyInputPanelProps {
  value: string | undefined
  onUserInput: (value: string) => void
  onInputBlur?: () => void
  onPercentInput?: (percent: number) => void
  onMax?: () => void
  showQuickInputButton?: boolean
  showMaxButton?: boolean
  maxAmount?: CurrencyAmount<Currency>
  label?: string
  onCurrencySelect?: (currency: Currency) => void
  currency?: Currency | null
  disableCurrencySelect?: boolean
  hideBalance?: boolean
  pair?: Pair | StablePair | null
  id: string
  showCommonBases?: boolean
  commonBasesType?: string
  showSearchInput?: boolean
  beforeButton?: React.ReactNode
  disabled?: boolean
  error?: boolean | string
  showUSDPrice?: boolean
  tokensToShow?: Token[]
  currencyLoading?: boolean
  inputLoading?: boolean
  title?: React.ReactNode
  hideBalanceComp?: boolean
  className?: string
}
const CurrencyInputPanel = memo(function CurrencyInputPanel({
  value,
  onUserInput,
  onInputBlur,
  onPercentInput,
  onMax,
  showQuickInputButton = false,
  showMaxButton,
  maxAmount,
  label,
  onCurrencySelect,
  currency,
  disableCurrencySelect = false,
  hideBalance = false,
  beforeButton,
  pair = null, // used for double token logo
  id,
  showCommonBases,
  commonBasesType,
  showSearchInput,
  disabled,
  error,
  showUSDPrice,
  tokensToShow,
  currencyLoading,
  inputLoading,
  title,
  hideBalanceComp,
  className,
}: CurrencyInputPanelProps) {
  const { address: account } = useAccount()

  const selectedCurrencyBalance = useCurrencyBalance(account ?? undefined, currency ?? undefined)
  const { t } = useTranslation()

  const mode = id

  const amountInDollar = useStablecoinPriceAmount(
    showUSDPrice ? currency ?? undefined : undefined,
    value !== undefined && Number.isFinite(+value) ? +value : undefined,
    {
      hideIfPriceImpactTooHigh: true,
      enabled: Boolean(value !== undefined && Number.isFinite(+value)),
    },
  )

  const [onPresentCurrencyModal] = useModal(
    <CurrencySearchModal
      onCurrencySelect={onCurrencySelect}
      selectedCurrency={currency}
      showCommonBases={showCommonBases}
      commonBasesType={commonBasesType}
      showSearchInput={showSearchInput}
      tokensToShow={tokensToShow}
      mode={mode}
    />,
  )

  const onCurrencySelectClick = useCallback(() => {
    if (disableCurrencySelect) return

    onPresentCurrencyModal()
  }, [onPresentCurrencyModal, disableCurrencySelect])

  const balance = !hideBalance && !!currency ? formatAmount(selectedCurrencyBalance, 6) : undefined
  const isToInput = useMemo(() => ['To', 'To (estimated)'].includes(label || ''), [label])

  return (
    <div className={clsx('relative rounded-2xl w-full', className)}>
      <div className="flex flex-col space-y-1 items-start xxs:flex-row xxs:space-y-0 xxs:space-x-2 xxs:items-center xxs:justify-between mb-2">
        {title}
        <div className="flex items-center space-x-2">
          {beforeButton}

          <button
            type="button"
            className={clsx('disabled:cursor-default', {
              'hover:opacity-70': !disableCurrencySelect,
            })}
            onClick={onCurrencySelectClick}
            disabled={disableCurrencySelect}
          >
            <div
              className={clsx('flex items-center py-1 pl-1 rounded-[20px] bg-neutral', {
                'pr-2': !currencyLoading && !disableCurrencySelect,
                'pr-4': !(!currencyLoading && !disableCurrencySelect),
              })}
            >
              {pair ? (
                <CurrencyLogoWithSymbol
                  currencyA={pair.token0}
                  currencyB={pair.token1}
                  symbol={`${pair.token0.symbol}-${pair.token1.symbol}`}
                />
              ) : currency ? (
                <CurrencyLogo currency={currency} size={28} className="mr-2" />
              ) : currencyLoading ? (
                <Skeleton width="24px" height="24px" variant="circle" />
              ) : null}

              {currencyLoading || pair ? null : (
                <span className="font-bold text-on-surface">
                  {(currency && currency.symbol && currency.symbol.length > 10
                    ? `${currency.symbol.slice(0, 4)}...${currency.symbol.slice(
                        currency.symbol.length - 5,
                        currency.symbol.length,
                      )}`
                    : currency?.symbol) || t('Select a currency')}
                </span>
              )}
              {!currencyLoading && !disableCurrencySelect && <CaretDown size={16} className="text-on-surface ml-2" />}
            </div>
          </button>
        </div>
        {account && !hideBalanceComp && (
          <button
            type="button"
            className={clsx('text-xs text-on-surface-subtle mr-2 self-end xxs:self-auto', {
              'hover:opacity-70': !disabled && !isToInput,
              'cursor-default': disabled || isToInput,
            })}
            onClick={!disabled ? onMax : undefined}
          >
            {!hideBalance && !!currency ? t('Balance: %balance%', { balance: balance ?? t('Loading') }) : ''}
          </button>
        )}
      </div>
      <div className="flex flex-col flex-nowrap relative bg-neutral rounded-2xl z-10">
        <div className="flex flex-nowrap px-4 pt-3">
          <NumberFormat
            disabled={disabled}
            className="text-on-surface text-lg bg-transparent w-full text-right focus:outline-none"
            value={value}
            onBlur={onInputBlur}
            onChange={(e) => {
              onUserInput(e.target.value.replace(/,/g, ''))
            }}
            thousandSeparator
            allowNegative={false}
            decimalScale={currency?.decimals}
            placeholder="0.00"
          />
        </div>

        {!!showUSDPrice && (
          <div className="flex items-center justify-end">
            <div className="max-w-[200px] pr-4">
              {inputLoading ? (
                <Loading size={16} className="text-on-surface-subtle" />
              ) : showUSDPrice && Number.isFinite(amountInDollar ?? 0) ? (
                <p className="text-xs text-on-surface-subtlest">
                  {`${amountInDollar ? `~${formatNumber(amountInDollar)}` : 0} USD`}
                </p>
              ) : (
                <></>
              )}
            </div>
          </div>
        )}

        {!isToInput && account ? (
          <div className="flex flex-nowrap items-center justify-end mt-2.5 pb-4 px-3">
            {currency && selectedCurrencyBalance?.greaterThan(0) && !disabled && (
              <div className="flex items-center justify-end space-x-2">
                {maxAmount?.greaterThan(0) &&
                  showQuickInputButton &&
                  onPercentInput &&
                  [25, 50, 75].map((percent) => {
                    return (
                      <PercentageButton key={`btn_quickCurrency${percent}`} onClick={() => onPercentInput(percent)}>
                        {percent}%
                      </PercentageButton>
                    )
                  })}
                {maxAmount?.greaterThan(0) && showMaxButton && (
                  <PercentageButton
                    onClick={(e) => {
                      e.stopPropagation()
                      e.preventDefault()
                      onMax?.()
                    }}
                  >
                    {t('Max')}
                  </PercentageButton>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="pb-3" />
        )}

        {error ? <p className="pb-2 text-xs text-red-500">{error}</p> : null}

        {disabled && <div className="absolute inset-0 bg-red-600 opacity-50" />}
      </div>
    </div>
  )
})

export default CurrencyInputPanel

function PercentageButton({
  children,
  onClick,
}: PropsWithChildren<{
  onClick: ButtonOnClickType
}>) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-[13px] bg-surface md:bg-surface-overlay px-2 py-1 text-on-surface rounded-2xl hover:opacity-70"
    >
      {children}
    </button>
  )
}
