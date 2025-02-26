import { useDebounce } from '@pancakeswap/hooks'
import { useTranslation } from '@pancakeswap/localization'
import { ButtonV2, Chip, SearchBar, SegmentedControl, Spinner } from '@pancakeswap/uikit'
import clsx from 'clsx'
import Page from 'components/Layout/Page'
import { useBackTo } from 'hooks/use-back-to'
import usePortfolio from 'hooks/use-portfolio'
import NextLink from 'next/link'
import { useMemo, useState } from 'react'
import { PoolType } from 'types'
import { getDefaultStaticProps } from 'utils/pageUtils'
import { Address } from 'viem'
import PoolTable from 'views/Dashboard/components/PoolTable'
import { MyPositionsSummary } from 'views/PoolsV2/components/MyPositionsSummary'
import PoolTypeSelector, { poolTypeSelectorOptions } from 'views/PoolsV2/components/PoolTypeSelector'
import { useAccount } from 'wagmi'

const PoolsPage = () => {
  const { address: account } = useAccount()

  const { t } = useTranslation()
  const { saveBackToHref } = useBackTo()

  const { portfolio, mutatePortfolio } = usePortfolio({
    account,
    poolTypes: ['v3', 'v2'],
  })

  const [boostedOnly, setBoostedOnly] = useState(false)
  const [searchKey, setSearchKey] = useState('')
  const [myPositionOnly, setMyPositionOnly] = useState(false)
  const [poolTypeOptions, setPoolTypeOptions] = useState(poolTypeSelectorOptions)

  const momoizedParams = useMemo(() => {
    return {
      boostedOnly,
      searchKey,
      poolTypes: poolTypeOptions.map(({ value }) => value as PoolType),
      addresses: myPositionOnly && portfolio ? (Object.keys(portfolio) as Address[]) : undefined,
    }
  }, [portfolio, boostedOnly, searchKey, poolTypeOptions, myPositionOnly])

  const debouncedParams = useDebounce(momoizedParams, 500)

  return (
    <Page title={t('Pools')} image="/images/og-images/pools.jpeg">
      {/* Header Section */}
      <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between">
        <div>
          <h1 className="text-[40px] font-medium">{t('Pools')}</h1>
          <p className="text-sm text-on-surface-subtlest">{t('Supply liquidity and maximize your yield.')}</p>
        </div>
        <NextLink href="/add" className="mt-4 xs:mt-0">
          <ButtonV2 variant="secondary" onClick={() => saveBackToHref()}>
            {t('Add Liquidity')}
          </ButtonV2>
        </NextLink>
      </div>

      {/* My Positions Section */}
      <div className="mt-8">
        <h2 className="text-xl font-medium">{t('My Positions')}</h2>
        <div className="mt-5">
          {account && !portfolio ? (
            <div className="rounded-xl p-6 bg-surface-raised flex justify-center items-center min-h-[180px]">
              <Spinner />
            </div>
          ) : (
            <MyPositionsSummary portfolio={portfolio} invalidatePortflio={() => mutatePortfolio()} />
          )}
        </div>
      </div>

      {/* All Pools Section */}
      <div className="mt-8">
        <h2 className="text-xl font-medium">{t('All Pools')}</h2>
        <div className="mt-5 space-x-3 flex items-center whitespace-nowrap overflow-x-auto">
          <div className="inline-block">
            <SegmentedControl
              options={['All', 'Boost🔥']}
              value={boostedOnly ? 'Boost🔥' : 'All'}
              onChange={(value) => setBoostedOnly(value === 'Boost🔥')}
              useTranslationOption
            />
          </div>
          <div
            className={clsx('inline-block', {
              hidden: Object.keys(portfolio ?? {}).length === 0,
            })}
          >
            <Chip
              label={t('My Position')}
              selected={myPositionOnly}
              setSelected={(v) => {
                if (v) {
                  setMyPositionOnly(true)
                  setPoolTypeOptions(poolTypeSelectorOptions)
                } else {
                  setMyPositionOnly(false)
                }
              }}
            />
          </div>
          <div className="inline-block flex-1 !mx-0" />
          <div className="hidden md:inline-block">
            <SearchBar value={searchKey} onChange={(e) => setSearchKey(e.target.value)} placeholder={t('Search...')} />
          </div>
          <div className="inline-block">
            <PoolTypeSelector
              selectedPoolTypes={poolTypeOptions}
              onSelectPoolTypes={(poolTypes) => setPoolTypeOptions(poolTypes as any)}
            />
          </div>
        </div>
        <div className="mt-3 md:hidden">
          <SearchBar
            fullWidth
            value={searchKey}
            onChange={(e) => setSearchKey(e.target.value)}
            placeholder={t('Search...')}
          />
        </div>
        <div className="mt-5">
          {debouncedParams.poolTypes.length === 0 ? (
            <div className="mt-8">
              <p className="text-on-surface">{t('Please select at least one pool type.')}</p>
              <ButtonV2
                className="mt-4"
                variant="secondary"
                onClick={() => setPoolTypeOptions(poolTypeSelectorOptions)}
              >
                {t('Select All')}
              </ButtonV2>
            </div>
          ) : (
            <PoolTable {...debouncedParams} portfolio={portfolio} initialSortBy="apy24H" openable />
          )}
        </div>
      </div>
    </Page>
  )
}

export default PoolsPage

export const getStaticProps = getDefaultStaticProps(['common'])
