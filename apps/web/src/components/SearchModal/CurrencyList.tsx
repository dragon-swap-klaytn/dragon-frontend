import { useTranslation } from '@pancakeswap/localization'
import { Currency, Token } from '@pancakeswap/sdk'
import { formatAmount } from '@pancakeswap/utils/formatFractions'
import { CurrencyLogo } from '@pancakeswap/widgets-internal'
import clsx from 'clsx'
import { DEFAULT_LOCAL_STORAGE_DATA, LOCAL_STORAGE_KEYS } from 'defines/local-storage-keys'
import useLocalStorage from 'hooks/use-local-storage-v2'
import { useActiveChainId } from 'hooks/useActiveChainId'
import useNativeCurrency from 'hooks/useNativeCurrency'
import { useCallback, useMemo } from 'react'
import { wrappedCurrency } from 'utils/wrappedCurrency'
import { useAccount } from 'wagmi'
import { useIsUserAddedToken } from '../../hooks/Tokens'
import { useCombinedActiveList } from '../../state/lists/hooks'
import { useCurrencyBalance } from '../../state/wallet/hooks'
import { isTokenOnList } from '../../utils'
import ImportRow from './ImportRow'

function CurrencyRow({
  currency,
  onSelect,
  isSelected,
}: {
  currency: Currency
  onSelect: () => void
  isSelected: boolean
}) {
  const { address: account } = useAccount()
  const { t } = useTranslation()
  const selectedTokenList = useCombinedActiveList()
  const isOnSelectedList = isTokenOnList(selectedTokenList, currency)
  const customAdded = useIsUserAddedToken(currency)

  const balance = useCurrencyBalance(account ?? undefined, currency)

  // only show add or remove buttons if not on selected list
  return (
    <button
      type="button"
      onClick={() => (isSelected ? null : onSelect())}
      disabled={isSelected}
      className={clsx('flex items-center justify-between w-full p-3 hover:opacity-70 rounded-md', {
        'bg-surface-container-highest': isSelected,
      })}
    >
      <div className="flex items-center space-x-2">
        <CurrencyLogo currency={currency} size={24} />
        <div className="flex flex-col items-start">
          <span className="font-bold text-sm text-on-surface-primary">{currency?.symbol}</span>

          <span className="text-xs max-w-40 overflow-hidden text-ellipsis text-gray-400 whitespace-nowrap">
            {!isOnSelectedList && customAdded && `${t('Added by user')} •`} {currency?.name}
          </span>
        </div>
      </div>

      {balance && <span className="text-right text-on-surface-primary text-sm">{formatAmount(balance, 4)}</span>}
    </button>
  )
}

export default function CurrencyList({
  currencies,
  inactiveCurrencies,
  selectedCurrency,
  onCurrencySelect,
  showNative,
  showImportView,
  setImportToken,
}: {
  currencies: Currency[]
  inactiveCurrencies: Currency[]
  selectedCurrency?: Currency | null
  onCurrencySelect: (currency: Currency) => void
  showNative: boolean
  showImportView: () => void
  setImportToken: (token: Token) => void
}) {
  const native = useNativeCurrency()

  const itemData: (Currency | undefined)[] = useMemo(() => {
    const formatted: (Currency | undefined)[] = showNative
      ? [native, ...currencies, ...inactiveCurrencies]
      : [...currencies, ...inactiveCurrencies]

    return formatted.sort((a, b) => {
      if (!a || !b) return 0

      return a.symbol.localeCompare(b.symbol)
    })
  }, [currencies, inactiveCurrencies, showNative, native])

  const { chainId } = useActiveChainId()

  const [recentSelectedCurrencies, setRecentSelectedCurrencies] = useLocalStorage<Currency[]>(
    LOCAL_STORAGE_KEYS.recentSelectedCurrencies,
    DEFAULT_LOCAL_STORAGE_DATA.recentSelectedCurrencies,
  )

  const Row = useCallback(
    ({ index }) => {
      const currency = itemData[index] as Token | undefined
      if (!currency) return null

      // the alternative to making a fiat currency token list
      // with class methods
      const isSelected = Boolean(selectedCurrency && currency && selectedCurrency.equals(currency))

      const handleSelect = () => {
        onCurrencySelect(currency)

        const newRecent =
          recentSelectedCurrencies?.filter(
            (c) => (c as Token).address.toLowerCase() !== currency.address.toLowerCase(),
          ) ?? []
        setRecentSelectedCurrencies([currency, ...newRecent].slice(0, 5))
      }

      const token = wrappedCurrency(currency, chainId)

      const showImport = index > currencies.length

      if (showImport && token) {
        return (
          <ImportRow
            onCurrencySelect={handleSelect}
            token={token}
            showImportView={showImportView}
            setImportToken={setImportToken}
          />
        )
      }

      return (
        <CurrencyRow
          key={`currencyRow:${currency.address}`}
          currency={currency}
          isSelected={isSelected}
          onSelect={handleSelect}
        />
      )
    },
    [
      selectedCurrency,
      chainId,
      currencies.length,
      onCurrencySelect,
      showImportView,
      setImportToken,
      itemData,
      recentSelectedCurrencies,
      setRecentSelectedCurrencies,
    ],
  )

  return <div className="flex flex-col overflow-y-auto max-h-[400px]">{itemData.map((_, index) => Row({ index }))}</div>
}
