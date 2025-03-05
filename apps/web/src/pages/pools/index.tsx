import { ChainId } from '@pancakeswap/chains'
import { useTranslation } from '@pancakeswap/localization'
import { CAKE } from '@pancakeswap/tokens'
import { ButtonV2, Chip, SearchBar, SegmentedControl, Spinner } from '@pancakeswap/uikit'
import clsx from 'clsx'
import Page from 'components/Layout/Page'
import usePortfolio from 'hooks/usePortfolio'
import useTokenBalance from 'hooks/useTokenBalance'
import { useUnwrapRewardV2 } from 'hooks/useUnwrapRewardV2'
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

  const { portfolio, mutatePortfolio } = usePortfolio({
    account,
    poolTypes: ['v3', 'v2'],
  })

  const [boostedOnly, setBoostedOnly] = useState(false)
  const [searchKey, setSearchKey] = useState('')
  const [myPositionOnly, setMyPositionOnly] = useState(false)
  const [poolTypeOptions, setPoolTypeOptions] = useState(poolTypeSelectorOptions)

  const cake = CAKE[ChainId.KLAYTN]
  const { balance, refetch } = useTokenBalance(cake.address)

  const { unwrapAllReward } = useUnwrapRewardV2({
    rewardToken: cake,
    onDone: () => {
      refetch()
    },
  })

  const momoizedParams = useMemo(() => {
    return {
      boostedOnly,
      searchKey,
      poolTypes: (myPositionOnly ? poolTypeSelectorOptions : poolTypeOptions).map(({ value }) => value as PoolType),
      addresses: myPositionOnly && portfolio ? (Object.keys(portfolio) as Address[]) : undefined,
    }
  }, [portfolio, boostedOnly, searchKey, poolTypeOptions, myPositionOnly])

  return (
    <Page title={t('Pools')} image="/images/og-images/pools.jpeg">
      {/* Header Section */}
      <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between">
        <div>
          <h1 className="text-[40px] font-medium">{t('Pools')}</h1>
          <p className="text-sm text-on-surface-subtlest">{t('Supply liquidity and maximize your yield.')}</p>
        </div>
        <NextLink href="/add" className="ml-4 mt-4 xs:mt-0">
          <ButtonV2 variant="secondary" onClick={() => {}}>
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
            <MyPositionsSummary
              onMyPositionsClick={() => {
                if (!myPositionOnly) {
                  setMyPositionOnly(true)
                }
                document.getElementById('pool-table')?.scrollIntoView({ behavior: 'smooth' })
              }}
              portfolio={portfolio}
              invalidatePortflio={() => mutatePortfolio()}
              onClaimed={refetch}
            />
          )}
        </div>

        {!balance.isZero() && (
          <div className="flex items-center justify-end w-full space-x-2 mt-2">
            <span className="text-sm text-right text-on-surface-subtle">
              {t('RKAIA Balances')}:{' '}
              {balance
                .div(10 ** cake.decimals)
                .precision(6)
                .toString()}
            </span>
            <ButtonV2 variant="primary" scale="xs" onClick={unwrapAllReward}>
              {t('Unwrap to KAIA')}
            </ButtonV2>
          </div>
        )}
      </div>

      {/* All Pools Section */}
      <div className="mt-8">
        <h2 id="pool-table" className="text-xl font-medium">
          {t('All Pools')}
        </h2>
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
            <Chip label={t('My Position')} selected={myPositionOnly} setSelected={setMyPositionOnly} />
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
          {momoizedParams.poolTypes.length === 0 ? (
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
            <PoolTable {...momoizedParams} portfolio={portfolio} initialSortBy="apy24H" openable />
          )}
        </div>
      </div>
    </Page>
  )
}

export default PoolsPage

export const getStaticProps = getDefaultStaticProps(['common'])
