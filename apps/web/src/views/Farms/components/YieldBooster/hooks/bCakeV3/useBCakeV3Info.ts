import { useQuery } from '@tanstack/react-query'
import BN from 'bignumber.js'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { useMasterchefV3 } from 'hooks/useContract'
import _toNumber from 'lodash/toNumber'
import { PRECISION_FACTOR } from './multiplierAPI'

export const USER_ESTIMATED_MULTIPLIER = 2

const QUERY_SETTINGS_WITHOUT_REFETCH = {
  retry: 3,
  retryDelay: 3000,
  keepPreviousData: true,
}

export const useIsBoostedPool = (tokenId?: string) => {
  const { chainId } = useActiveChainId()
  const { data, refetch } = useQuery(
    [`v3/bcake/isBoostedPool/${chainId}/${tokenId}`],
    () => [false, tokenId], // farmBoosterV3Contract.read.isBoostedPool([BigInt(tokenId ?? 0)]),
    {
      enabled: Boolean(chainId && tokenId && tokenId !== 'undefined'),
      ...QUERY_SETTINGS_WITHOUT_REFETCH,
    },
  )

  return { isBoosted: data?.[0], pid: Number(data?.[1]), mutate: refetch }
}

export const useUserPositionInfo = (tokenId?: string | number) => {
  const { chainId } = useActiveChainId()
  const masterChefV3 = useMasterchefV3()

  const { data, refetch } = useQuery(
    [`v3/masterChef/userPositionInfos/${chainId}/${tokenId}`],
    () => {
      return masterChefV3?.read.userPositionInfos([BigInt(tokenId ?? 0)])
    },
    {
      enabled: Boolean(chainId && tokenId && +tokenId > 0),
      ...QUERY_SETTINGS_WITHOUT_REFETCH,
    },
  )

  return {
    data: {
      liquidity: data?.[0],
      boostLiquidity: data?.[1],
      tickLower: data?.[2],
      tickUpper: data?.[3],
      rewardGrowthInside: data?.[4],
      reward: data?.[5],
      user: data?.[6],
      pid: data?.[7],
      boostMultiplier: _toNumber(new BN(data?.[8]?.toString() ?? 0).div(PRECISION_FACTOR).toString()),
    },
    updateUserPositionInfo: refetch,
  }
}
