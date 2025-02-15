import { LP_HOLDERS_FEE } from 'config/constants/info'
import { PoolV2Detailed, PoolV3Detailed } from 'pools/get-cached-pools-data'
import { PoolType } from 'types'
import { calculateAPY } from 'utils/calculate-interests'

const HOUR = 60 * 60 * 1000
const DAY = 24 * HOUR
const WEEK = 7 * DAY

type WithAPY<T> = T & {
  type: PoolType
  apy: {
    '24H': number
    '7D': number
  }
}

export const parseV2Pool = (pool: PoolV2Detailed): WithAPY<PoolV2Detailed> => {
  const apy24H = calculateAPY({
    interest: pool.volumeUSD['24H'] * LP_HOLDERS_FEE,
    principal: pool.tvlUSD.current,
    duration: DAY,
  })

  const apy7D = calculateAPY({
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
  }
}

export const parseV3Pool = (pool: PoolV3Detailed): WithAPY<PoolV3Detailed> => {
  const apy24H = calculateAPY({
    interest: pool.feeUSD['24H'],
    principal: pool.tvlUSD.current,
    duration: DAY,
  })

  const apy7D = calculateAPY({
    interest: pool.feeUSD['7D'],
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
  }
}
