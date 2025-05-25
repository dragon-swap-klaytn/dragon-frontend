import { useTranslation } from '@pancakeswap/localization'
import { Currency, Token } from '@pancakeswap/sdk'
import { QuestionHelper } from '@pancakeswap/uikit'
import { CurrencyLogo } from '@pancakeswap/widgets-internal'
import useNativeCurrency from 'hooks/useNativeCurrency'

import { TETHER_TOKEN } from 'const'
import useRecentSelectedCurrencies from 'hooks/useRecentSelectedCurrencies'
import { CommonBasesType } from './types'

export const PINNED_CURRENCIES = [TETHER_TOKEN]

export default function CommonBases({
  onSelect,
  selectedCurrency,
  commonBasesType,
}: {
  commonBasesType?: string
  selectedCurrency?: Currency | null
  onSelect: (currency: Currency) => void
}) {
  const native = useNativeCurrency()
  const { t } = useTranslation()

  const { recentSelectedCurrencies, setRecentSelectedCurrency } = useRecentSelectedCurrencies()

  return (
    <div className="pb-4 border-b border-border">
      <div className="flex items-center space-x-1">
        <h3 className="text-brand text-xs">{t('Recent tokens')}</h3>

        {commonBasesType === CommonBasesType.LIQUIDITY && (
          <QuestionHelper text={t('These tokens are commonly paired with other tokens.')} ml="4px" />
        )}
      </div>

      <div className="flex items-center space-x-2 overflow-x-auto mt-2">
        <RecentTokenButton
          onClick={() => onSelect(native)}
          currency={native}
          selected={selectedCurrency === native}
          symbol={native.symbol}
        />

        {PINNED_CURRENCIES.map((currency) => (
          <RecentTokenButton
            key={`pinnedCurrency:${currency.address}`}
            onClick={() => onSelect(currency)}
            currency={currency}
            selected={selectedCurrency?.wrapped?.address.toLocaleLowerCase() === currency.address.toLowerCase()}
            symbol={currency.symbol}
          />
        ))}

        {recentSelectedCurrencies.map((currency) => {
          const address = currency?.address
          const selected = selectedCurrency?.wrapped?.address.toLocaleLowerCase() === address.toLowerCase()

          return (
            <RecentTokenButton
              key={`recentTokenButton:${address}`}
              onClick={() => {
                onSelect(currency)
                setRecentSelectedCurrency(currency as Token)
              }}
              currency={currency}
              address={address}
              selected={selected}
              symbol={currency.symbol}
            />
          )
        })}
      </div>
    </div>
  )
}

function RecentTokenButton({
  onClick,
  currency,
  address,
  selected,
  symbol,
}: {
  onClick: () => void
  currency?: Currency
  address?: string
  selected: boolean
  symbol: string
}) {
  return (
    <button
      type="button"
      className="pl-1 py-1 pr-3 bg-neutral rounded-[20px] hover:opacity-70 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
      onClick={onClick}
      disabled={selected}
    >
      <CurrencyLogo currency={currency} address={address} />
      <span className="text-[13px] text-on-surface whitespace-nowrap">{symbol}</span>
    </button>
  )
}
