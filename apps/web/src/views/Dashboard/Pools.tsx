import { useDebounce } from '@pancakeswap/hooks'
import { useTranslation } from '@pancakeswap/localization'
import { SearchBar } from '@pancakeswap/uikit'
import { DashboardPoolType } from 'pages/dashboard'
import { useState } from 'react'
import Header from 'views/Dashboard/components/Header'
import PoolTable from './components/PoolTable'

export default function Pools({ poolType = 'v3' }: { poolType: DashboardPoolType }) {
  const { t } = useTranslation()

  const [searchInput, setSearchInput] = useState('')
  const debouncedSearchInput = useDebounce(searchInput, 500)

  return (
    <div className="w-full flex flex-col items-start space-y-5">
      <div className="flex flex-col xs:flex-row xs:items-center space-y-2 xs:space-y-0 xs:space-x-2 justify-between w-full">
        <Header title={t('All Pools')} />

        <SearchBar
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="self-end"
          placeholder="Search"
          width="w-52"
        />
      </div>

      <PoolTable poolType={poolType} searchInput={debouncedSearchInput} />
    </div>
  )
}
