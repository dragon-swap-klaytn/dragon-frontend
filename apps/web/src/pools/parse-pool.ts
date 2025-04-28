import { LP_HOLDERS_FEE } from 'config/constants/info'
import { PoolV2Detailed, PoolV3Detailed } from 'pools/get-cached-pools-data'
import { PoolType } from 'types'
import { calculateAPR, calculateAPY } from 'utils/calculate-interests'

const HOUR = 60 * 60 * 1000
const DAY = 24 * HOUR
const WEEK = 7 * DAY

type WithAPY<T> = T & {
  type: PoolType
  apy: {
    '24H': number | null
    '7D': number | null
  }
  apr: {
    '24H': number | null
    '7D': number | null
  }
}

export const parseV2Pool = (pool: PoolV2Detailed): WithAPY<PoolV2Detailed> => {
  const apy24H =
    pool.volumeUSD['24H'] === null
      ? null
      : calculateAPY({
          interest: pool.volumeUSD['24H'] * LP_HOLDERS_FEE,
          principal: pool.tvlUSD.current,
          duration: DAY,
        })

  const apy7D =
    pool.volumeUSD['7D'] === null
      ? null
      : calculateAPY({
          interest: pool.volumeUSD['7D'] * LP_HOLDERS_FEE,
          principal: pool.tvlUSD.current,
          duration: WEEK,
        })

  const apr24H =
    pool.volumeUSD['24H'] === null
      ? null
      : calculateAPR({
          interest: pool.volumeUSD['24H'] * LP_HOLDERS_FEE,
          principal: pool.tvlUSD.current,
          duration: DAY,
        })

  const apr7D =
    pool.volumeUSD['7D'] === null
      ? null
      : calculateAPR({
          interest: pool.volumeUSD['7D'] * LP_HOLDERS_FEE,
          principal: pool.tvlUSD.current,
          duration: WEEK,
        })

  return {
    type: 'v2',
    ...pool,
    apy: {
      '24H': apy24H,
      '7D': apy7D,
    },
    apr: {
      '24H': apr24H,
      '7D': apr7D,
    },
  }
}

export const parseV3Pool = (pool: PoolV3Detailed): WithAPY<PoolV3Detailed> => {
  const apy24H =
    pool.feeUSD['24H'] === null || pool.protocolFeeUSD['24H'] === null
      ? null
      : calculateAPY({
          interest: pool.feeUSD['24H'] - pool.protocolFeeUSD['24H'],
          principal: pool.tvlUSD.current,
          duration: DAY,
        })

  const apy7D =
    pool.feeUSD['7D'] === null || pool.protocolFeeUSD['7D'] === null
      ? null
      : calculateAPY({
          interest: pool.feeUSD['7D'] - pool.protocolFeeUSD['7D'],
          principal: pool.tvlUSD.current,
          duration: WEEK,
        })

  const apr24H =
    pool.feeUSD['24H'] === null || pool.protocolFeeUSD['24H'] === null
      ? null
      : calculateAPR({
          interest: pool.feeUSD['24H'] - pool.protocolFeeUSD['24H'],
          principal: pool.tvlUSD.current,
          duration: DAY,
        })

  const apr7D =
    pool.feeUSD['7D'] === null || pool.protocolFeeUSD['7D'] === null
      ? null
      : calculateAPR({
          interest: pool.feeUSD['7D'] - pool.protocolFeeUSD['7D'],
          principal: pool.tvlUSD.current,
          duration: WEEK,
        })

  return {
    type: 'v3',
    ...pool,
    apy: {
      '24H': apy24H,
      '7D': apy7D,
    },
    apr: {
      '24H': apr24H,
      '7D': apr7D,
    },
  }
}
