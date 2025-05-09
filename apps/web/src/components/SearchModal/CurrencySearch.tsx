/* eslint-disable no-restricted-syntax */
import { useDebounce } from '@pancakeswap/hooks'
import { useTranslation } from '@pancakeswap/localization'
import { Currency, Token } from '@pancakeswap/sdk'
import { SearchBar, Spinner, useMatchBreakpoints } from '@pancakeswap/uikit'
import { useAudioPlay } from '@pancakeswap/utils/user'
import useNativeCurrency from 'hooks/useNativeCurrency'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FixedSizeList } from 'react-window'
import { safeGetAddress } from 'utils'
import { useTokenMap, useTokens } from '../../hooks/Tokens'
import CommonBases from './CommonBases'
import CurrencyList from './CurrencyList'
import { getSwapSound } from './swapSound'

interface CurrencySearchProps {
  selectedCurrency?: Currency | null
  onCurrencySelect: (currency: Currency) => void
  showSearchInput?: boolean
  showCommonBases?: boolean
  commonBasesType?: string
  showImportView: () => void
  setImportToken: (token: Token) => void
  tokensToShow?: Token[]
}

function CurrencySearch({
  selectedCurrency,
  onCurrencySelect,
  showCommonBases,
  commonBasesType,
  showSearchInput = true,
  showImportView,
  setImportToken,
  tokensToShow,
}: CurrencySearchProps) {
  const { t } = useTranslation()

  // refs for fixed size lists
  const fixedList = useRef<FixedSizeList>()

  const [searchQuery, setSearchQuery] = useState<string>('')
  const debouncedQuery = useDebounce(searchQuery, 500)

  const { tokenMap: onlyPoolTokenMap } = useTokenMap({ poolOnly: true })
  const searchTokens = useTokens(debouncedQuery)

  const { isMobile } = useMatchBreakpoints()
  const [audioPlay] = useAudioPlay()

  const native = useNativeCurrency()

  const showNative: boolean = useMemo(() => {
    if (tokensToShow) return false
    const s = debouncedQuery.toLowerCase().trim()
    return native && native.symbol?.toLowerCase?.()?.indexOf(s) !== -1
  }, [debouncedQuery, native, tokensToShow])

  const currencies = useMemo(
    () => searchTokens || (onlyPoolTokenMap ? Object.values(onlyPoolTokenMap) : ([] as Token[])),
    [onlyPoolTokenMap, searchTokens],
  )
  const handleCurrencySelect = useCallback(
    (currency: Currency) => {
      onCurrencySelect(currency)
      if (audioPlay) {
        getSwapSound().play()
      }
    },
    [audioPlay, onCurrencySelect],
  )

  // manage focus on modal show
  const inputRef = useRef<HTMLInputElement>()

  useEffect(() => {
    if (!isMobile) inputRef.current?.focus()
  }, [isMobile])

  const handleInput = useCallback((event) => {
    const input = event.target.value
    const checksummedInput = safeGetAddress(input)
    setSearchQuery(checksummedInput || input)
    fixedList.current?.scrollTo(0)
  }, [])

  const getCurrencyListRows = useCallback(() => {
    return !currencies ? (
      <div className="min-h-[350px] flex items-center justify-center">
        <Spinner />
      </div>
    ) : currencies.length > 0 ? (
      <CurrencyList
        showNative={showNative}
        currencies={currencies}
        onCurrencySelect={handleCurrencySelect}
        selectedCurrency={selectedCurrency}
        showImportView={showImportView}
        setImportToken={setImportToken}
        searchQuery={debouncedQuery}
      />
    ) : (
      <p className="text-center py-4 text-on-surface text-sm">{t('No results found.')}</p>
    )
  }, [
    currencies,
    handleCurrencySelect,
    selectedCurrency,
    setImportToken,
    showNative,
    showImportView,
    t,
    debouncedQuery,
  ])

  const searchBarRef = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (!searchBarRef.current) return
    if (!showSearchInput) return

    searchBarRef.current.focus()
  }, [showSearchInput])

  return (
    <div className="flex flex-col space-y-4">
      {showSearchInput && <SearchBar ref={searchBarRef} value={searchQuery} onChange={handleInput} fullWidth />}

      {showCommonBases && (
        <CommonBases
          onSelect={handleCurrencySelect}
          selectedCurrency={selectedCurrency}
          commonBasesType={commonBasesType}
        />
      )}

      {getCurrencyListRows()}
    </div>
  )
}

export default CurrencySearch
