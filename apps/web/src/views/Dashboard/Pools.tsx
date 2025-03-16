import { useDebounce } from '@pancakeswap/hooks'
import { useTranslation } from '@pancakeswap/localization'
import { SearchBar } from '@pancakeswap/uikit'
import { DEFAULT_POOLS_FILTERS } from 'const'
import useRouterReady from 'hooks/useRouterReady'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { PoolType } from 'types'
import useDeepCompareEffect from 'use-deep-compare-effect'
import isEmptyObject from 'utils/isEmptyObject'
import Header from 'views/Dashboard/components/Header'
import PoolTable from './components/PoolTable'

type PoolsBaseParams = {
  poolTypes: PoolType[]
  searchKey: string
}
export default function Pools({ poolTypes = ['v3'] }: { poolTypes: PoolType[] }) {
  const { t } = useTranslation()

  const [searchKey, setSearchKey] = useState('')
  const debouncedSearchKey = useDebounce(searchKey, 500)

  const router = useRouter()
  const isRouterReady = useRouterReady()

  // To use useDeepCompareEffect, initialize with {} instead of null.
  const [baseParams, setBaseParams] = useState<PoolsBaseParams>({} as PoolsBaseParams)

  useEffect(() => {
    if (!router.isReady || !isRouterReady) return
    if (!isEmptyObject(baseParams)) return

    const { poolsSearchKey: _searchKey } = router.query || {}

    if (!_searchKey) {
      setBaseParams({
        searchKey: DEFAULT_POOLS_FILTERS.searchKey,
        poolTypes,
      })

      return
    }

    const newSearchKey = typeof _searchKey === 'string' ? _searchKey : ''
    setSearchKey(newSearchKey)

    setBaseParams({
      searchKey: newSearchKey,
      poolTypes,
    })
  }, [router.query, router.isReady, baseParams, isRouterReady, poolTypes])

  useDeepCompareEffect(() => {
    if (isEmptyObject(baseParams) || !isRouterReady) return
    setBaseParams({
      searchKey: debouncedSearchKey,
      poolTypes,
    })
  }, [debouncedSearchKey, baseParams, isRouterReady, poolTypes])

  return (
    <div className="w-full flex flex-col items-start space-y-5">
      <div className="flex flex-col xs:flex-row xs:items-center space-y-2 xs:space-y-0 xs:space-x-2 justify-between w-full">
        <Header id="pools" title={t('Pools')} />

        <SearchBar
          value={searchKey}
          onChange={(e) => setSearchKey(e.target.value)}
          className="self-end"
          placeholder="Search..."
          width="w-52"
        />
      </div>

      <PoolTable baseParams={baseParams} />
    </div>
  )
}
