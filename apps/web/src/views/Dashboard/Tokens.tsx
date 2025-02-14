import { useDebounce } from '@pancakeswap/hooks'
import { useTranslation } from '@pancakeswap/localization'
import { SearchBar } from '@pancakeswap/uikit'
import { DashboardPoolType } from 'pages/dashboard'
import { useState } from 'react'
import Header from 'views/Dashboard/components/Header'
import TokenTable from './components/TokenTable'

export default function Tokens({ poolType = 'v3' }: { poolType?: DashboardPoolType }) {
  const { t } = useTranslation()

  const [searchInput, setSearchInput] = useState('')
  const debouncedSearchInput = useDebounce(searchInput, 500)

  return (
    <>
      {/* {!showAll && <TopTokenMovers tokens={tokens} />} */}
      {/* <TopTokenMovers tokens={tokens} /> */}

      <div className="flex flex-col xxs:flex-row xxs:items-center space-y-2 xxs:space-y-0 xxs:space-x-2 justify-between w-full">
        <Header title={t('All Tokens')} />

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
