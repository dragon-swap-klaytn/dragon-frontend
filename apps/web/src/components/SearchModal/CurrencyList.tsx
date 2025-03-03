import { useTranslation } from '@pancakeswap/localization'
import { Currency, Token } from '@pancakeswap/sdk'
import { Spinner, ZERO_ADDRESS } from '@pancakeswap/uikit'
import { CurrencyLogo } from '@pancakeswap/widgets-internal'
import { Plus } from '@phosphor-icons/react'
import clsx from 'clsx'
import { useCakePrice } from 'hooks/useCakePrice'
import useNativeCurrency from 'hooks/useNativeCurrency'
import useRecentSelectedCurrencies from 'hooks/useRecentSelectedCurrencies'
import useTokenPrices from 'hooks/useTokenPrices'
import { useCallback, useMemo } from 'react'
import { useAccount, useBalance } from 'wagmi'
import { useIsTokenActive, useIsUserAddedToken } from '../../hooks/Tokens'
import { useTokenBalancesWithLoading } from '../../state/wallet/hooks'

function CurrencyRow({
  currencyWithValue,
  onSelect,
  isSelected,
  showImportView,
  setImportToken,
}: {
  currencyWithValue: {
    currency: Currency
    amount: number
    value: number
  }
  onSelect: () => void
  isSelected: boolean
  showImportView: () => void
  setImportToken: (token: Token) => void
}) {
  const { address: account } = useAccount()
  const { t } = useTranslation()
  const { currency, amount, value } = currencyWithValue

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

          <span className="text-xs max-w-40 text-gray-400 whitespace-nowrap line-clamp-1 truncate inline-block">
            {isAdded && `${t('Added by user')} •`} {currency?.name}
          </span>
        </div>
      </div>

      {account ? (
        needToImport ? (
          <Plus size={16} className="text-gray-200" />
        ) : (
          <div className="flex flex-col items-end">
            <span className="text-right text-on-surface text-sm">{amount > 0 ? amount.toFixed(4) : amount}</span>
            {value > 0 && <span className="text-right text-on-surface-subtlest text-xs">${value.toFixed(4)}</span>}
          </div>
        )
      ) : (
        <></>
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
  const { address: account } = useAccount()
  const tokens = useMemo(() => currencies.filter((currency): currency is Token => currency.isToken), [currencies])

  const cakePrice = useCakePrice()
  const { prices, pricesLoading } = useTokenPrices()
  // use swapscanner price as fallback
  const { prices: ssPrices, pricesLoading: pricesLoadingFromSs } = useTokenPrices({ source: 'swapscanner' })

  const [balances, balancesLoading] = useTokenBalancesWithLoading(account, tokens)
  const { data: nativeBalance, isLoading } = useBalance({ address: account, enabled: true })

  const currenciesWithValue = useMemo(() => {
    if (balancesLoading || isLoading || pricesLoading || pricesLoadingFromSs) {
      return undefined
    }

    const formatted = showNative ? [native, ...currencies] : [...currencies]

    if (!account) {
      return formatted
        .sort((a, b) => a.symbol.localeCompare(b.symbol))
        .map((currency) => ({ currency, amount: 0, value: 0 }))
    }

    return formatted
      .map((currency) => {
        if (currency.isNative) {
          const amount = +(nativeBalance?.formatted || 0)
          return {
            currency,
            amount,
            value: amount * cakePrice.toNumber(),
          }
        }

        const { address } = currency.wrapped

        const amount = +(balances[address]?.toExact() || 0)
        const price = prices?.[address] || ssPrices?.[address] || 0

        return {
          currency,
          amount,
          value: amount * price,
        }
      })
      .sort((a, b) => b.value - a.value)
  }, [
    currencies,
    nativeBalance,
    balances,
    showNative,
    native,
    cakePrice,
    prices,
    ssPrices,
    balancesLoading,
    isLoading,
    pricesLoading,
    pricesLoadingFromSs,
    account,
  ])

  const { setRecentSelectedCurrency } = useRecentSelectedCurrencies()

  const Row = useCallback(
    ({ index }) => {
      if (!currenciesWithValue) return null

      const currencyWithValue = currenciesWithValue[index]
      if (!currencyWithValue) return null

      const currency = currencyWithValue?.currency
      if (!currency) return null

      // the alternative to making a fiat currency token list
      // with class methods
      const isSelected = Boolean(
        selectedCurrency && currencyWithValue && selectedCurrency?.equals(currencyWithValue.currency),
      )

      const handleSelect = () => {
        onCurrencySelect(currencyWithValue.currency)
        setRecentSelectedCurrency(currencyWithValue.currency as Token)
      }

      return (
        <CurrencyRow
          key={`currencyRow:${currency.isNative ? ZERO_ADDRESS : currency.wrapped.address}`}
          currencyWithValue={currencyWithValue}
          isSelected={isSelected}
          onSelect={handleSelect}
          showImportView={showImportView}
          setImportToken={setImportToken}
        />
      )
    },
    [
      selectedCurrency,
      onCurrencySelect,
      showImportView,
      setImportToken,
      setRecentSelectedCurrency,
      currenciesWithValue,
    ],
  )

  return (
    <div className="flex flex-col overflow-y-auto max-h-[400px] space-y-1">
      {currenciesWithValue ? (
        currenciesWithValue.map((_, index) => Row({ index }))
      ) : (
        <div className="flex items-center justify-center w-full h-[400px]">
          <Spinner />
        </div>
      )}
    </div>
  )
}
