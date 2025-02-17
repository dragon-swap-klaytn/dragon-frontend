import { useTranslation } from '@pancakeswap/localization'
import { Spinner, useMatchBreakpoints } from '@pancakeswap/uikit'
import { BIG_ONE, BIG_ZERO } from '@pancakeswap/utils/bigNumber'
import BigNumber from 'bignumber.js'
import clsx from 'clsx'
import { Portfolio } from 'hooks/use-portfolio'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { useCakePrice } from 'hooks/useCakePrice'
import { useRouter } from 'next/router'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useFarms } from 'state/farms/hooks'
import { useFarmsV3WithPositionsAndBooster } from 'state/farmsV3/hooks'
import { PoolType } from 'types'
import { getFarmApr } from 'utils/apr'
import { Address } from 'viem'
import Pagination from 'views/Dashboard/components/Pagination'
import { PoolDataRow, PoolDataRowSkeleton } from 'views/Dashboard/components/PoolTable/PoolDataRow'
import SortHeaderButton from 'views/Dashboard/components/SortHeaderButton'
import usePools, { PoolsSortBy } from 'views/Dashboard/hooks/usePools'
import { SortDirection } from 'views/Dashboard/types'
import { V2FarmWithoutStakedValue, V2StakeValueAndV3Farm, V3Farm, V3FarmWithoutStakedValue } from 'views/Farms/FarmsV3'

const HEADER_IDS = ['pool', 'tvl', 'apy24H', 'apy7D', 'volume24H', 'volume7D'] as const
type HeaderId = (typeof HEADER_IDS)[number]

const TITLES = ['Pool', 'TVL', 'Apy 24H', 'Apy 7D', 'Volume 24H', 'Volume 7D'] as const
type Title = (typeof TITLES)[number]

const HEADERS: {
  id: HeaderId
  title: Title
  sortBy?: PoolsSortBy
}[] = [
  { id: 'pool', title: 'Pool' },
  { id: 'tvl', title: 'TVL', sortBy: 'tvl' },
  { id: 'volume24H', title: 'Volume 24H', sortBy: 'volume24H' },
  { id: 'volume7D', title: 'Volume 7D', sortBy: 'volume7D' },
  { id: 'apy24H', title: 'Apy 24H', sortBy: 'apy24H' },
  { id: 'apy7D', title: 'Apy 7D', sortBy: 'apy7D' },
]

const bSmeaders: Partial<HeaderId>[] = ['pool', 'tvl', 'volume24H']
const smHeaders: Partial<HeaderId>[] = [...bSmeaders, 'apy24H']
const mdHeaders: Partial<HeaderId>[] = [...smHeaders, 'apy7D', 'volume7D']

const SHOW_POOL_COUNT = 10

type V2AndV3Farms = Array<V3FarmWithoutStakedValue | V2FarmWithoutStakedValue>

export default function PoolTable({
  poolTypes,
  searchKey,
  tokenAddress,
  addresses,
  boostedOnly,
  portfolio,
}: {
  poolTypes?: PoolType[]
  searchKey?: string
  tokenAddress?: string
  addresses?: Address[]
  boostedOnly?: boolean
  portfolio?: Portfolio
}) {
  const { t } = useTranslation()

  // for sorting
  const [sortBy, setSortBy] = useState<PoolsSortBy>('tvl')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  // pagination
  const [page, setPage] = useState(1)
  const skip = (page - 1) * SHOW_POOL_COUNT
  const [_totalPage, setTotalPage] = useState(1)

  const [isFirstRender, setIsFirstRender] = useState(true)

  const { poolsData, totalPage } = usePools({
    poolTypes,
    skip,
    tokenAddress,
    boostedOnly,
    searchKey,
    sortBy,
    sortDirection,
    addresses,
  })

  useEffect(() => {
    if (poolsData && poolsData.length > 0) {
      setIsFirstRender(false)
    }
  }, [poolsData])

  useEffect(() => {
    if (totalPage === undefined) return

    setTotalPage(totalPage)
  }, [totalPage])

  const paramsString = [
    poolTypes?.join('-') ?? '',
    tokenAddress,
    boostedOnly ? 'boosted' : '',
    searchKey,
    sortBy,
    sortDirection,
    addresses?.join('-') ?? '',
  ].join(';')

  useEffect(() => {
    setPage(1)
  }, [searchKey, paramsString])

  const handleSort = useCallback(
    (newField: PoolsSortBy) => {
      setSortBy(newField)
      setSortDirection(sortBy !== newField ? 'desc' : sortDirection === 'desc' ? 'asc' : 'desc')
    },
    [sortDirection, sortBy],
  )

  const { isBelowSm, isSm, isMd, isMobile } = useMatchBreakpoints()
  const headers = useMemo(
    () =>
      HEADERS.filter(({ id }) =>
        isBelowSm ? bSmeaders.includes(id) : isSm ? smHeaders.includes(id) : isMd ? mdHeaders.includes(id) : true,
      ),
    [isSm, isBelowSm, isMd],
  )

  const { pathname, query: urlQuery } = useRouter()

  // TODO: @daniel remove farms related codes
  const mockApr = Boolean(urlQuery.mockApr)
  const { chainId } = useActiveChainId()
  const { data: farmsV2, poolLength: v2PoolLength, regularCakePerBlock } = useFarms()
  const { farmsWithPositions: farmsV3, poolLength: v3PoolLength } = useFarmsV3WithPositionsAndBooster(
    { mockApr },
    false,
  )

  // TODO: @daniel remove farms related codes
  // FIXME: temporary sort sable v2 farm in front of v3 farms
  const farmsLP: V2AndV3Farms = useMemo(() => {
    const farms: V2AndV3Farms = [
      ...farmsV3.map((f) => ({ ...f, version: 3 } as V3FarmWithoutStakedValue)),
      ...farmsV2.map((f) => ({ ...f, version: 2 } as V2FarmWithoutStakedValue)),
    ]
    return farms
  }, [farmsV2, farmsV3])

  const cakePrice = useCakePrice()

  const isArchived = pathname.includes('archived')
  const isInactive = pathname.includes('history')
  const isActive = !isInactive && !isArchived

  const activeFarms = farmsLP.filter(
    (farm) =>
      farm.pid !== 0 &&
      // (isFinished ? farm.multiplier === '0X' : farm.multiplier !== '0X') &&
      (farm.version === 3 ? !v3PoolLength || v3PoolLength >= farm.pid : !v2PoolLength || v2PoolLength > farm.pid),
  )

  const farmsList = useCallback(
    (farmsToDisplay: V2AndV3Farms): V2StakeValueAndV3Farm[] => {
      const farmsToDisplayWithAPR: any = farmsToDisplay.map((farm) => {
        if (farm.version === 3) {
          return farm
        }

        if (!farm.quoteTokenAmountTotal || !farm.quoteTokenPriceBusd) {
          return farm
        }
        const totalLiquidityFromLp = new BigNumber(farm?.lpTotalInQuoteToken ?? 0).times(farm.quoteTokenPriceBusd)
        // Mock 1$ tvl if the farm doesn't have lp staked
        const totalLiquidity = totalLiquidityFromLp.eq(BIG_ZERO) && mockApr ? BIG_ONE : totalLiquidityFromLp
        const { cakeRewardsApr, lpRewardsApr } =
          isActive && chainId
            ? getFarmApr(
                chainId,
                new BigNumber(farm?.poolWeight ?? 0),
                cakePrice,
                totalLiquidity,
                farm.lpAddress,
                regularCakePerBlock,
              )
            : { cakeRewardsApr: 0, lpRewardsApr: 0 }

        return { ...farm, apr: cakeRewardsApr, lpRewardsApr, liquidity: totalLiquidity }
      })

      return farmsToDisplayWithAPR
    },
    [mockApr, chainId, cakePrice, isActive, regularCakePerBlock],
  )

  const chosenFarms = useMemo(() => {
    let chosenFs: V2StakeValueAndV3Farm[] = []
    chosenFs = farmsList(activeFarms)

    chosenFs = chosenFs.filter(
      (farm) => farm.lpAddress.toLowerCase() !== '0xb39A385dba6aB12B09391F9a30ea927EAa4754Ef'.toLowerCase(),
    )

    return chosenFs
  }, [farmsList, activeFarms])

  return (
    <div className="w-full">
      <table className="w-full rounded-xl overflow-hidden">
        <colgroup>
          <col width="*" />
          <col width="110px" />
          <col width="110px" />
          {!isMobile && <col width="110px" />}
          {!isBelowSm && <col width="100px" />}
          {!isMobile && <col width="100px" />}
        </colgroup>
        <thead>
          <tr className="text-on-surface-subtle bg-neutral text-xs">
            {headers.map(({ title, sortBy: s }, index) => (
              <th
                key={`poolTable:${s}`}
                className={clsx('py-3 text-left', {
                  'px-4 s:px-6': index === 0,
                  'px-4': index !== 0,
                })}
              >
                {s ? (
                  <SortHeaderButton
                    title={title}
                    onClick={() => handleSort(s as PoolsSortBy)}
                    isSelected={sortBy === s}
                    sortDirection={sortDirection}
                  />
                ) : (
                  <>{title}</>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isFirstRender ? (
            <tr>
              <td colSpan={headers.length} className="h-[250px] md:h-[300px] text-center">
                <div className="flex items-center justify-center w-full">
                  <Spinner />
                </div>
              </td>
            </tr>
          ) : !poolsData ? (
            Array.from({ length: SHOW_POOL_COUNT }).map((_, index) => (
              <PoolDataRowSkeleton key={`poolTableSkeleton:${index + 1}`} isLastIndex={index === SHOW_POOL_COUNT - 1} />
            ))
          ) : poolsData.length > 0 ? (
            poolsData.map((poolData, index) => (
              <PoolDataRow
                key={`poolTable:${poolData.id}`}
                // TODO: @daniel change farm prop to positions[]
                farm={chosenFarms.find((farm) => farm.lpAddress.toLowerCase() === poolData.id.toLowerCase()) as V3Farm}
                userData={portfolio?.[poolData.id]}
                poolData={poolData}
                isLastIndex={index === poolsData.length - 1}
              />
            ))
          ) : (
            <tr>
              <td colSpan={headers.length} className="h-[250px] md:h-[300px] text-center">
                <div className="flex items-center justify-center w-full">
                  <p className="text-on-surface">{t('No Pools')}</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {_totalPage > 1 && (
        <div className="mt-5">
          <Pagination page={page} setPage={setPage} totalPage={_totalPage} />
        </div>
      )}
    </div>
  )
}
