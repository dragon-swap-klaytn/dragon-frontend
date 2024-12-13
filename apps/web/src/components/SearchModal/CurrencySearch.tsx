/* eslint-disable no-restricted-syntax */
import { useDebounce, useSortedTokensByQuery } from '@pancakeswap/hooks'
import { useTranslation } from '@pancakeswap/localization'
import { Currency, Token } from '@pancakeswap/sdk'
import { WrappedTokenInfo, createFilterToken } from '@pancakeswap/token-lists'
import { Column, Text, useMatchBreakpoints } from '@pancakeswap/uikit'
import { useAudioPlay } from '@pancakeswap/utils/user'
import SearchBar from 'components/Common/SearchBar'
import { useActiveChainId } from 'hooks/useActiveChainId'
import useNativeCurrency from 'hooks/useNativeCurrency'
import { KeyboardEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FixedSizeList } from 'react-window'
import { useAllLists, useInactiveListUrls } from 'state/lists/hooks'
import { safeGetAddress } from 'utils'
import { isAddress } from 'viem'
import { whiteListedFiatCurrenciesMap } from 'views/BuyCrypto/constants'
import { useAllTokens, useTokens } from '../../hooks/Tokens'
import CommonBases from './CommonBases'
import CurrencyList from './CurrencyList'
import useTokenComparator from './sorting'
import { getSwapSound } from './swapSound'

interface CurrencySearchProps {
  selectedCurrency?: Currency | null
  onCurrencySelect: (currency: Currency) => void
  otherSelectedCurrency?: Currency | null
  showSearchInput?: boolean
  showCommonBases?: boolean
  commonBasesType?: string
  showImportView: () => void
  setImportToken: (token: Token) => void
  height?: number
  tokensToShow?: Token[]
  mode?: string
  onRampFlow?: boolean
}

function useSearchInactiveTokenLists(search: string | undefined, minResults = 10): WrappedTokenInfo[] {
  const lists = useAllLists()
  const inactiveUrls = useInactiveListUrls()
  const { chainId } = useActiveChainId()
  const activeTokens = useAllTokens()
  return useMemo(() => {
    if (!search || search.trim().length === 0) return []
    const filterToken = createFilterToken(search, (address) => isAddress(address))
    const exactMatches: WrappedTokenInfo[] = []
    const rest: WrappedTokenInfo[] = []
    const addressSet: { [address: string]: true } = {}
    const trimmedSearchQuery = search.toLowerCase().trim()
    for (const url of inactiveUrls) {
      const list = lists[url]?.current
      // eslint-disable-next-line no-continue
      if (!list) continue
      for (const tokenInfo of list.tokens) {
        if (
          tokenInfo.chainId === chainId &&
          !(tokenInfo.address in activeTokens) &&
          !addressSet[tokenInfo.address] &&
          filterToken(tokenInfo)
        ) {
          const wrapped: WrappedTokenInfo = new WrappedTokenInfo({
            ...tokenInfo,
            address: safeGetAddress(tokenInfo.address) || tokenInfo.address,
          })
          addressSet[wrapped.address] = true
          if (
            tokenInfo.name?.toLowerCase() === trimmedSearchQuery ||
            tokenInfo.symbol?.toLowerCase() === trimmedSearchQuery
          ) {
            exactMatches.push(wrapped)
          } else {
            rest.push(wrapped)
          }
        }
      }
    }
    return [...exactMatches, ...rest].slice(0, minResults)
  }, [activeTokens, chainId, inactiveUrls, lists, minResults, search])
}

function CurrencySearch({
  selectedCurrency,
  onCurrencySelect,
  otherSelectedCurrency,
  showCommonBases,
  commonBasesType,
  showSearchInput = true,
  showImportView,
  setImportToken,
  height,
  tokensToShow,
  mode,
  onRampFlow,
}: CurrencySearchProps) {
  const { t } = useTranslation()
  const { chainId } = useActiveChainId()

  // refs for fixed size lists
  const fixedList = useRef<FixedSizeList>()

  const [searchQuery, setSearchQuery] = useState<string>('')
  const debouncedQuery = useDebounce(searchQuery, 200)

  const [invertSearchOrder] = useState<boolean>(false)

  const allTokens = useAllTokens()
  // useEffect(() => {
  //   console.log('allTokens', allTokens)
  // }, [allTokens])

  // if they input an address, use it
  // const searchToken = useToken(debouncedQuery)
  const searchTokens = useTokens(debouncedQuery)
  // useEffect(() => {
  //   console.log('searchToken', searchToken)
  // }, [searchToken])
  // const searchTokenIsAdded = useIsUserAddedToken(searchToken)
  // useEffect(() => {
  //   console.log('searchTokenIsAdded', searchTokenIsAdded)
  // }, [searchTokenIsAdded])

  const { isMobile } = useMatchBreakpoints()
  const [audioPlay] = useAudioPlay()

  const native = useNativeCurrency()

  const showNative: boolean = useMemo(() => {
    if (tokensToShow || mode === 'onramp-input') return false
    const s = debouncedQuery.toLowerCase().trim()
    return native && native.symbol?.toLowerCase?.()?.indexOf(s) !== -1
  }, [debouncedQuery, native, tokensToShow, mode])

  const filteredTokens: Token[] = useMemo(() => {
    // console.log('__tokensToShow', tokensToShow)
    // console.log('__allTokens_2', allTokens)
    // console.log('__debouncedQuery', debouncedQuery)
    const filterToken = createFilterToken(debouncedQuery, (address) => isAddress(address))
    return Object.values(tokensToShow || allTokens).filter((_t) => filterToken(_t))
  }, [tokensToShow, allTokens, debouncedQuery])
  // useEffect(() => {
  //   console.log('tokensToShow', tokensToShow)
  // }, [tokensToShow])
  // useEffect(() => {
  //   console.log('filteredTokens', filteredTokens)
  // }, [filteredTokens])

  const queryTokens = useSortedTokensByQuery(filteredTokens, debouncedQuery)
  // useEffect(() => {
  //   console.log('queryTokens', queryTokens)
  // }, [queryTokens])
  const filteredQueryTokens = useMemo(() => {
    if (!chainId) return queryTokens
    return mode === 'onramp-input'
      ? queryTokens.filter((curr) => whiteListedFiatCurrenciesMap[chainId].includes(curr.symbol))
      : queryTokens
  }, [mode, queryTokens, chainId])

  const tokenComparator = useTokenComparator(invertSearchOrder)

  const filteredSortedTokens: Token[] = useMemo(() => {
    return onRampFlow ? [...filteredQueryTokens] : [...filteredQueryTokens].sort(tokenComparator)
  }, [filteredQueryTokens, tokenComparator, onRampFlow])
  // useEffect(() => {
  //   console.log('filteredSortedTokens', filteredSortedTokens)
  // }, [filteredSortedTokens])

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

  const handleEnter = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        const s = debouncedQuery.toLowerCase().trim()
        if (s === native.symbol.toLowerCase().trim()) {
          handleCurrencySelect(native)
        } else if (filteredSortedTokens.length > 0) {
          if (
            filteredSortedTokens[0].symbol?.toLowerCase() === debouncedQuery.trim().toLowerCase() ||
            filteredSortedTokens.length === 1
          ) {
            handleCurrencySelect(filteredSortedTokens[0])
          }
        }
      }
    },
    [debouncedQuery, filteredSortedTokens, handleCurrencySelect, native],
  )

  // if no results on main list, show option to expand into inactive
  const filteredInactiveTokens = useSearchInactiveTokenLists(debouncedQuery)
  const hasFilteredInactiveTokens = Boolean(filteredInactiveTokens?.length)
  useEffect(() => {
    console.log('hasFilteredInactiveTokens', hasFilteredInactiveTokens)
  }, [hasFilteredInactiveTokens])

  const filteredTokensWithSs = useMemo(() => {
    // [...filteredSortedTokens, ...(searchTokens ?? [])]
    const result = [...filteredSortedTokens]
    if (searchTokens) {
      for (const token of searchTokens) {
        if (!result.find((_t) => _t.address.toLowerCase() === token.address.toLowerCase())) {
          result.push(token)
        }
      }
    }

    return result.sort(tokenComparator)
  }, [searchTokens, filteredSortedTokens, tokenComparator])

  const getCurrencyListRows = useCallback(() => {
    // if (searchToken && !searchTokenIsAdded && !hasFilteredInactiveTokens) {
    // if (searchTokens && !hasFilteredInactiveTokens) {
    //   return (
    //     <Box mx="-24px" my="24px">
    //       {searchTokens.map((token) => (
    //         <Row key={token.address}>
    //           <ImportRow
    //             style={{ width: '100%' }}
    //             onCurrencySelect={handleCurrencySelect}
    //             token={token}
    //             showImportView={showImportView}
    //             setImportToken={setImportToken}
    //           />
    //         </Row>
    //       ))}
    //     </Box>
    //   )
    // }

    // return Boolean(filteredSortedTokens?.length) || hasFilteredInactiveTokens || mode === 'onramp-output' ? (
    return filteredTokensWithSs?.length ? (
      <CurrencyList
        height={isMobile ? (showCommonBases ? height || 250 : height ? height + 80 : 350) : 390}
        showNative={showNative}
        currencies={filteredTokensWithSs}
        inactiveCurrencies={mode === 'onramp-input' ? [] : filteredInactiveTokens}
        breakIndex={
          Boolean(filteredInactiveTokens?.length) && filteredTokensWithSs ? filteredTokensWithSs.length : undefined
        }
        onCurrencySelect={handleCurrencySelect}
        otherCurrency={otherSelectedCurrency}
        selectedCurrency={selectedCurrency}
        fixedListRef={fixedList}
        showImportView={showImportView}
        setImportToken={setImportToken}
        mode={mode as string}
      />
    ) : (
      <Column style={{ padding: '20px', height: '100%' }}>
        <Text color="textSubtle" textAlign="center" mb="20px">
          {t('No results found.')}
        </Text>
      </Column>
    )
  }, [
    filteredInactiveTokens,
    // filteredSortedTokens,
    filteredTokensWithSs,
    handleCurrencySelect,
    // hasFilteredInactiveTokens,
    otherSelectedCurrency,
    // searchTokens,
    // searchTokenIsAdded,
    selectedCurrency,
    setImportToken,
    showNative,
    showImportView,
    t,
    showCommonBases,
    isMobile,
    height,
    mode,
  ])

  const searchBarRef = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (!searchBarRef.current) return
    if (!showSearchInput) return

    searchBarRef.current.focus()
  }, [showSearchInput])

  return (
    <div className="flex flex-col space-y-4">
      {showSearchInput && (
        <SearchBar ref={searchBarRef} value={searchQuery} onChange={handleInput} onKeyDown={handleEnter} fullWidth />
      )}

      {showCommonBases && (
        <CommonBases
          chainId={chainId}
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
