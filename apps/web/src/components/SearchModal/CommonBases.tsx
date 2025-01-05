import { useTranslation } from '@pancakeswap/localization'
import { Currency, Token } from '@pancakeswap/sdk'
import { QuestionHelper } from '@pancakeswap/uikit'
import { CurrencyLogo } from '@pancakeswap/widgets-internal'
import useNativeCurrency from 'hooks/useNativeCurrency'

import { DEFAULT_LOCAL_STORAGE_DATA, LOCAL_STORAGE_KEYS } from 'defines/local-storage-keys'
import useLocalStorage from 'hooks/use-local-storage-v2'
import { CommonBasesType } from './types'

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

  const [recentSelectedCurrencies] = useLocalStorage<Currency[]>(
    LOCAL_STORAGE_KEYS.recentSelectedCurrencies,
    DEFAULT_LOCAL_STORAGE_DATA.recentSelectedCurrencies,
  )

  return (
    <div>
      <div className="flex items-center space-x-1">
        <h3 className="text-on-surface-primary font-bold text-sm">{t('Recent tokens')}</h3>

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

        {(recentSelectedCurrencies ?? []).map((currency) => {
          const { address } = currency as Token
          const selected = selectedCurrency?.wrapped.address.toLocaleLowerCase() === address.toLowerCase()

          return (
            <RecentTokenButton
              key={`buttonRecent:${address}`}
              onClick={() => onSelect(currency)}
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
      className="px-2 py-1.5 rounded-lg border hover:opacity-70 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
      onClick={onClick}
      disabled={selected}
    >
      <CurrencyLogo currency={currency} address={address} />
      <span className="text-[13px] text-on-surface-primary">{symbol}</span>
    </button>
  )
}
