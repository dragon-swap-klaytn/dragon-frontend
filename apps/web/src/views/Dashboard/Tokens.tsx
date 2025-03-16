import { useDebounce } from '@pancakeswap/hooks'
import { useTranslation } from '@pancakeswap/localization'
import { SearchBar } from '@pancakeswap/uikit'
import useRouterReady from 'hooks/useRouterReady'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useState } from 'react'
import { PoolType } from 'types'
import useDeepCompareEffect from 'use-deep-compare-effect'
import isEmptyObject from 'utils/isEmptyObject'
import Header from 'views/Dashboard/components/Header'
import TokenTable from './components/TokenTable'

export const DEFAULT_TOKENS_FILTERS = {
  poolType: 'v3' as PoolType,
  searchKey: '',
  sortBy: 'volume24H' as const,
  sortDirection: 'desc' as const,
  page: 1,
}

type TokensBaseParams = {
  poolType: PoolType
  searchKey: string
}
export default function Tokens({ poolType = 'v3' }: { poolType?: PoolType }) {
  const { t } = useTranslation()

  const [searchKey, setSearchKey] = useState('')
  const debouncedSearchKey = useDebounce(searchKey, 500)

  const router = useRouter()
  const isRouterReady = useRouterReady()

  // To use useDeepCompareEffect, initialize with {} instead of null.
  const [baseParams, setBaseParams] = useState<TokensBaseParams>({} as TokensBaseParams)

  useEffect(() => {
    if (!router.isReady || !isRouterReady) return
    if (!isEmptyObject(baseParams)) return

    const { tokensSearchKey: _searchKey } = router.query || {}

    if (!_searchKey) {
      setBaseParams({
        searchKey: DEFAULT_TOKENS_FILTERS.searchKey,
        poolType,
      })

      return
    }

    const newSearchKey = (_searchKey || '') as string
    setSearchKey(newSearchKey)

    setBaseParams({
      searchKey: newSearchKey,
      poolType,
    })
  }, [router.query, router.isReady, baseParams, isRouterReady, poolType])

  useDeepCompareEffect(() => {
    if (isEmptyObject(baseParams) || !isRouterReady) return
    setBaseParams({
      searchKey: debouncedSearchKey,
      poolType,
    })
  }, [debouncedSearchKey, baseParams, isRouterReady, poolType])

  const resetBaseParams = useCallback(() => {
    setBaseParams({} as TokensBaseParams)
    setSearchKey(DEFAULT_TOKENS_FILTERS.searchKey)
  }, [])

  return (
    <>
      <div className="flex flex-col xs:flex-row xs:items-center space-y-2 xs:space-y-0 xs:space-x-2 justify-between w-full">
        <Header id="tokens" title={t('Tokens')} />

        <SearchBar
          value={searchKey}
          onChange={(e) => setSearchKey(e.target.value)}
          className="self-end"
          placeholder="Search"
          width="w-52"
        />
      </div>

      <TokenTable baseParams={baseParams} resetBaseParams={resetBaseParams} />
    </>
  )
}
