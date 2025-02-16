import { useDebounce } from '@pancakeswap/hooks'
import { useTranslation } from '@pancakeswap/localization'
import { SearchBar } from '@pancakeswap/uikit'
import { useState } from 'react'
import { PoolType } from 'types'
import Header from 'views/Dashboard/components/Header'
import TokenTable from './components/TokenTable'

export default function Tokens({ poolType = 'v3' }: { poolType?: PoolType }) {
  const { t } = useTranslation()

  const [searchInput, setSearchInput] = useState('')
  const debouncedSearchInput = useDebounce(searchInput, 500)

  return (
    <>
      <div className="flex flex-col xs:flex-row xs:items-center space-y-2 xs:space-y-0 xs:space-x-2 justify-between w-full">
        <Header id="tokens" title={t('All Tokens')} />

        <SearchBar
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="self-end"
          placeholder="Search"
          width="w-52"
        />
      </div>

      <TokenTable poolType={poolType} searchInput={debouncedSearchInput} />
    </>
  )
}
