import { useTranslation } from '@pancakeswap/localization'
import { Currency, Token } from '@pancakeswap/sdk'
import { formatAmount } from '@pancakeswap/utils/formatFractions'
import { CurrencyLogo } from '@pancakeswap/widgets-internal'
import { Plus } from '@phosphor-icons/react'
import clsx from 'clsx'
import useRecentSelectedCurrencies from 'hooks/use-recent-selected-currencies'
import useNativeCurrency from 'hooks/useNativeCurrency'
import { useCallback, useMemo } from 'react'
import { useAccount } from 'wagmi'
import { useIsTokenActive, useIsUserAddedToken } from '../../hooks/Tokens'
import { useCurrencyBalance } from '../../state/wallet/hooks'

function CurrencyRow({
  currency,
  onSelect,
  isSelected,
  showImportView,
  setImportToken,
}: {
  currency: Currency
  onSelect: () => void
  isSelected: boolean
  showImportView: () => void
  setImportToken: (token: Token) => void
}) {
  const { address: account } = useAccount()
  const { t } = useTranslation()
  const balance = useCurrencyBalance(account ?? undefined, currency)

  const isAdded = useIsUserAddedToken(currency)
  const isActive = useIsTokenActive(currency)
  const needToImport = useMemo(() => !isAdded && !isActive, [isAdded, isActive])

  return (
    <button
      type="button"
      onClick={() => {
        if (isSelected) return

        if (needToImport) {
          setImportToken(currency as Token)
          showImportView()
        } else {
          onSelect()
        }
      }}
      disabled={isSelected}
      className={clsx('flex items-center justify-between w-full py-2 pl-2 pr-4 hover:opacity-70 rounded-xl', {
        'bg-neutral': isSelected,
      })}
    >
      <div className="flex items-center space-x-2.5">
        <CurrencyLogo currency={currency} size={24} />

        <div className="flex flex-col items-start">
          <span className="font-bold text-sm text-on-surface text-left line-clamp-1">{currency?.symbol}</span>

          <span className="text-xs max-w-40 text-gray-400 whitespace-nowrap line-clamp-1">
            {isAdded && `${t('Added by user')} •`} {currency?.name}
          </span>
        </div>
      </div>

      {needToImport ? (
        <Plus size={16} className="text-gray-200" />
      ) : (
        balance && <span className="text-right text-on-surface text-sm">{formatAmount(balance, 4)}</span>
      )}
    </button>
  )
}

export default function CurrencyList({
  currencies,
  selectedCurrency,
  onCurrencySelect,
  showNative,
  showImportView,
  setImportToken,
}: {
  currencies: Currency[]
  selectedCurrency?: Currency | null
  onCurrencySelect: (currency: Currency) => void
  showNative: boolean
  showImportView: () => void
  setImportToken: (token: Token) => void
}) {
  const native = useNativeCurrency()

  const itemData: (Currency | undefined)[] = useMemo(() => {
    const formatted: (Currency | undefined)[] = showNative ? [native, ...currencies] : [...currencies]

    return formatted.sort((a, b) => {
      if (!a || !b) return 0

      return a.symbol.localeCompare(b.symbol)
    })
  }, [currencies, showNative, native])

  const { setRecentSelectedCurrency } = useRecentSelectedCurrencies()

  const Row = useCallback(
    ({ index }) => {
      const currency = itemData[index] as Token | undefined
      if (!currency) return null

      // the alternative to making a fiat currency token list
      // with class methods
      const isSelected = Boolean(selectedCurrency && currency && selectedCurrency?.equals(currency))

      const handleSelect = () => {
        onCurrencySelect(currency)
        setRecentSelectedCurrency(currency as Token)
      }

      return (
        <CurrencyRow
          key={`currencyRow:${currency.address}`}
          currency={currency}
          isSelected={isSelected}
          onSelect={handleSelect}
          showImportView={showImportView}
          setImportToken={setImportToken}
        />
      )
    },
    [selectedCurrency, onCurrencySelect, showImportView, setImportToken, itemData, setRecentSelectedCurrency],
  )

  return (
    <div className="flex flex-col overflow-y-auto max-h-[400px] space-y-1">
      {itemData.map((_, index) => Row({ index }))}
    </div>
  )
}
