import {
  DeserializedFarm,
  FarmV3DataWithPriceAndUserInfo,
  FarmWithStakedValue,
  filterFarmsByQuery,
  supportedChainIdV2,
  supportedChainIdV3,
} from '@pancakeswap/farms'
import { useIntersectionObserver } from '@pancakeswap/hooks'
import { useTranslation } from '@pancakeswap/localization'
import { OptionProps } from '@pancakeswap/uikit'

import { BIG_ONE, BIG_ZERO } from '@pancakeswap/utils/bigNumber'
import BigNumber from 'bignumber.js'
import { V3SubgraphHealthIndicator } from 'components/SubgraphHealthIndicator'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { useCakePrice } from 'hooks/useCakePrice'
import orderBy from 'lodash/orderBy'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useFarms, usePollFarmsWithUserData } from 'state/farms/hooks'
import { useFarmsV3WithPositionsAndBooster } from 'state/farmsV3/hooks'
import { useUserFarmStakedOnly, useUserFarmsViewMode } from 'state/user/hooks'
import { PoolType } from 'types'
import { getFarmApr } from 'utils/apr'
import Pools from 'views/Dashboard/Pools'
import { useFinishedFarm } from 'views/Farms/hooks/useFinishedFarm'
import { getStakedFarms } from 'views/Farms/utils/getStakedFarms'
import { useAccount } from 'wagmi'
import { FarmsV3Context } from './context'

const NUMBER_OF_FARMS_VISIBLE = 12

export interface V3FarmWithoutStakedValue extends FarmV3DataWithPriceAndUserInfo {
  version: 3
}

export interface V3Farm extends V3FarmWithoutStakedValue {
  version: 3
}

export interface V2FarmWithoutStakedValue extends DeserializedFarm {
  version: 2
}

export interface V2Farm extends FarmWithStakedValue {
  version: 2
}

type V2AndV3Farms = Array<V3FarmWithoutStakedValue | V2FarmWithoutStakedValue>

export type V2StakeValueAndV3Farm = V3Farm | V2Farm

const Farms: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { pathname, query: urlQuery } = useRouter()
  const isFinished = useFinishedFarm()

  const mockApr = Boolean(urlQuery.mockApr)
  const { t } = useTranslation()
  const { chainId } = useActiveChainId()
  const { data: farmsV2, userDataLoaded: v2UserDataLoaded, poolLength: v2PoolLength, regularCakePerBlock } = useFarms()
  const {
    farmsWithPositions: farmsV3,
    poolLength: v3PoolLength,
    isLoading,
    userDataLoaded: v3UserDataLoaded,
  } = useFarmsV3WithPositionsAndBooster({ mockApr }, isFinished)

  // FIXME: temporary sort sable v2 farm in front of v3 farms
  const farmsLP: V2AndV3Farms = useMemo(() => {
    const farms: V2AndV3Farms = [
      ...farmsV3.map((f) => ({ ...f, version: 3 } as V3FarmWithoutStakedValue)),
      ...farmsV2.map((f) => ({ ...f, version: 2 } as V2FarmWithoutStakedValue)),
    ]
    return farms
  }, [farmsV2, farmsV3])

  const cakePrice = useCakePrice()

  const [_query, setQuery] = useState('')
  const normalizedUrlSearch = useMemo(() => (typeof urlQuery?.search === 'string' ? urlQuery.search : ''), [urlQuery])
  const query = normalizedUrlSearch && !_query ? normalizedUrlSearch : _query

  const [viewMode, setViewMode] = useUserFarmsViewMode()
  const { address: account } = useAccount()
  const [sortOption, setSortOption] = useState('hot')
  const { observerRef, isIntersecting } = useIntersectionObserver()
  const chosenFarmsLength = useRef(0)

  const isArchived = pathname.includes('archived')
  const isInactive = pathname.includes('history')
  const isActive = !isInactive && !isArchived

  usePollFarmsWithUserData()

  // Users with no wallet connected should see 0 as Earned amount
  // Connected users should see loading indicator until first userData has loaded
  const userDataReady =
    !account ||
    (!!account &&
      (chainId && supportedChainIdV2.includes(chainId) ? v2UserDataLoaded : true) &&
      (chainId && supportedChainIdV3.includes(chainId) ? v3UserDataLoaded : true))

  const [stakedOnly, setStakedOnly] = useUserFarmStakedOnly(isActive)
  const [v3FarmOnly, setV3FarmOnly] = useState(false)
  const [v2FarmOnly, setV2FarmOnly] = useState(false)
  const [boostedOnly, setBoostedOnly] = useState(false)
  const [stableSwapOnly, setStableSwapOnly] = useState(false)
  const [farmTypesEnableCount, setFarmTypesEnableCount] = useState(0)

  const activeFarms = farmsLP.filter(
    (farm) =>
      farm.pid !== 0 &&
      // (isFinished ? farm.multiplier === '0X' : farm.multiplier !== '0X') &&
      (farm.version === 3 ? !v3PoolLength || v3PoolLength >= farm.pid : !v2PoolLength || v2PoolLength > farm.pid),
  )

  const inactiveFarms = farmsLP.filter((farm) => farm.pid !== 0 && farm.multiplier === '0X')
  const archivedFarms = farmsLP

  const stakedOnlyFarms = useMemo(() => getStakedFarms(activeFarms), [activeFarms])
  const stakedInactiveFarms = useMemo(() => getStakedFarms(inactiveFarms), [inactiveFarms])
  const stakedArchivedFarms = useMemo(() => getStakedFarms(archivedFarms), [archivedFarms])

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

      return filterFarmsByQuery(farmsToDisplayWithAPR, query)
    },
    [query, mockApr, chainId, cakePrice, isActive, regularCakePerBlock],
  )

  const handleChangeQuery = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value)
  }

  const [numberOfFarmsVisible, setNumberOfFarmsVisible] = useState(NUMBER_OF_FARMS_VISIBLE)

  const chosenFarms = useMemo(() => {
    let chosenFs: V2StakeValueAndV3Farm[] = []
    if (isActive) {
      chosenFs = stakedOnly ? farmsList(stakedOnlyFarms) : farmsList(activeFarms)
    }
    if (isInactive) {
      chosenFs = stakedOnly ? farmsList(stakedInactiveFarms) : farmsList(inactiveFarms)
    }
    if (isArchived) {
      chosenFs = stakedOnly ? farmsList(stakedArchivedFarms) : farmsList(archivedFarms)
    }

    chosenFs = chosenFs.filter(
      (farm) => farm.lpAddress.toLowerCase() !== '0xb39A385dba6aB12B09391F9a30ea927EAa4754Ef'.toLowerCase(),
    )

    if (v3FarmOnly || v2FarmOnly || boostedOnly || stableSwapOnly) {
      const filterFarmsWithTypes = chosenFs.filter(
        (farm) =>
          (v3FarmOnly && farm.version === 3) ||
          (v2FarmOnly && farm.version === 2) ||
          (boostedOnly && farm.boosted && farm.version === 3) ||
          (stableSwapOnly && farm.version === 2 && farm.isStable),
      )

      const stakedFilterFarmsWithTypes = getStakedFarms(filterFarmsWithTypes)

      chosenFs = stakedOnly ? farmsList(stakedFilterFarmsWithTypes) : farmsList(filterFarmsWithTypes)
    }

    return chosenFs
  }, [
    isActive,
    isInactive,
    isArchived,
    stakedOnly,
    farmsList,
    stakedOnlyFarms,
    activeFarms,
    stakedInactiveFarms,
    inactiveFarms,
    stakedArchivedFarms,
    archivedFarms,
    boostedOnly,
    stableSwapOnly,
    v3FarmOnly,
    v2FarmOnly,
  ])

  const chosenFarmsMemoized = useMemo(() => {
    const sortFarms = (farms: V2StakeValueAndV3Farm[]): V2StakeValueAndV3Farm[] => {
      switch (sortOption) {
        case 'apr':
          return orderBy(farms, (farm) => (farm.version === 3 ? Number(farm.cakeApr) : farm.apr ?? 0), 'desc')
        case 'multiplier':
          return orderBy(farms, (farm) => (farm.multiplier ? Number(farm.multiplier.slice(0, -1)) : 0), 'desc')
        case 'earned':
          return orderBy(
            farms,
            (farm) => {
              if (farm.version === 2) {
                return farm.userData ? Number(farm.userData.earnings) : 0
              }
              const totalEarned = Object.values(farm.pendingCakeByTokenIds)
                .reduce((a, b) => a + b, 0n)
                .toString()
              return account ? totalEarned : 0
            },
            'desc',
          )
        case 'liquidity':
          return orderBy(
            farms,
            (farm) => {
              if (farm.version === 3) {
                return Number(farm.activeTvlUSD)
              }
              return Number(farm.liquidity)
            },
            'desc',
          )
        case 'latest':
          return orderBy(
            orderBy(farms, (farm) => Number(farm.pid), 'desc'),
            ['version'],
            'desc',
          )
        default:
          return farms
      }
    }

    return sortFarms(chosenFarms).slice(0, numberOfFarmsVisible)
  }, [chosenFarms, numberOfFarmsVisible, sortOption, account])

  chosenFarmsLength.current = chosenFarmsMemoized.length

  useEffect(() => {
    if (isIntersecting) {
      setNumberOfFarmsVisible((farmsCurrentlyVisible) => {
        if (farmsCurrentlyVisible <= chosenFarmsLength.current) {
          return farmsCurrentlyVisible + NUMBER_OF_FARMS_VISIBLE
        }
        return farmsCurrentlyVisible
      })
    }
  }, [isIntersecting])

  const handleSortOptionChange = (option: OptionProps): void => {
    setSortOption(option.value)
  }

  const providerValue = useMemo(() => ({ chosenFarmsMemoized }), [chosenFarmsMemoized])
  const [poolTypes, setPoolTypes] = useState<PoolType[]>(['v3', 'v2'])

  return (
    <FarmsV3Context.Provider value={providerValue}>
      <div className="px-5 md:px-8 mx-auto w-full flex flex-col items-center space-y-8 max-w-6xl">
        <Pools poolTypes={poolTypes} />

        <V3SubgraphHealthIndicator />
      </div>
    </FarmsV3Context.Provider>
  )
}

export default Farms
