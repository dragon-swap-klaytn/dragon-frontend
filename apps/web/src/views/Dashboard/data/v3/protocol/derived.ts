import { ChainId } from '@pancakeswap/chains'
import { fetchPoolChartData } from 'views/Dashboard/data/v3/pool/chartData'
import { fetchPoolDatas } from 'views/Dashboard/data/v3/pool/poolData'
import { fetchTopPoolAddresses } from 'views/Dashboard/data/v3/pool/topPools'
import { POOL_HIDE } from '../../../constants'
import { ChartDayData, V3PoolChartEntry, V3PoolData } from '../../../types'

/**
 * Calculates offset amount to avoid inaccurate USD data for global TVL.
 * @returns TVL value in USD
 */
export async function fetchTVLOffset() {
  try {
    const { addresses } = await fetchTopPoolAddresses()
    if (!addresses) {
      return 0
    }

    const { data } = await fetchPoolDatas(addresses, [])
    if (!data) {
      return 0
    }

    return Object.keys(data).reduce((accum: number, poolAddress) => {
      const poolData: V3PoolData = data[poolAddress]
      return accum + poolData.tvlUSD
    }, 0)
  } catch (e) {
    console.error(e)
    return 0
  }
}

/**
 * Fecthes and formats data for pools that result in incorrect USD TVL.
 *
 * Note: not used currently but useful for debugging.
 *
 * @returns Chart data by day for values to offset accurate USD.
 */
export async function fetchDerivedOffsetTVLHistory(chainId: ChainId) {
  // fetch all data for each pool
  try {
    const chartData = await POOL_HIDE[chainId].reduce(
      async (accumP: Promise<{ [key: number]: ChartDayData }>, address) => {
        const accum = await accumP
        const { data } = await fetchPoolChartData(address)
        if (!data) return accum
        data.forEach((poolDayData: V3PoolChartEntry) => {
          const { date, totalValueLockedUSD, volumeUSD } = poolDayData
          const roundedDate = date
          if (!accum[roundedDate]) {
            accum[roundedDate] = {
              tvlUSD: 0,
              date: roundedDate,
              volumeUSD: 0,
            }
          }
          // eslint-disable-next-line operator-assignment
          accum[roundedDate].tvlUSD = accum[roundedDate].tvlUSD + totalValueLockedUSD
          // eslint-disable-next-line operator-assignment
          accum[roundedDate].volumeUSD = accum[roundedDate].volumeUSD + volumeUSD
        })
        return accum
      },
      Promise.resolve({} as { [key: number]: ChartDayData }),
    )

    return chartData
  } catch (e) {
    console.error(e)
    return {}
  }
}

// # of pools to include in historical chart volume and TVL data
const POOL_COUNT_FOR_AGGREGATE = 20

/**
 * Derives historical TVL data for top 50 pools.
 * @returns Chart data for aggregate Uniswap TVL over time.
 */
export async function fetchDerivedProtocolTVLHistory() {
  try {
    const { addresses } = await fetchTopPoolAddresses()
    if (!addresses) {
      return []
    }
    // fetch all data for each pool
    const chartData = await addresses
      .slice(0, POOL_COUNT_FOR_AGGREGATE) // @TODO: must be replaced with aggregate with subgraph data fixed.
      .reduce(async (accumP: Promise<{ [key: number]: ChartDayData }>, address) => {
        const accum = await accumP
        const { data } = await fetchPoolChartData(address)
        if (!data) return accum
        data.forEach((poolDayData: V3PoolChartEntry) => {
          const { date, totalValueLockedUSD, volumeUSD } = poolDayData
          const roundedDate = date
          if (!accum[roundedDate]) {
            accum[roundedDate] = {
              tvlUSD: 0,
              date: roundedDate,
              volumeUSD: 0,
            }
          }
          // eslint-disable-next-line operator-assignment
          accum[roundedDate].tvlUSD = accum[roundedDate].tvlUSD + totalValueLockedUSD
          // eslint-disable-next-line operator-assignment
          accum[roundedDate].volumeUSD = accum[roundedDate].volumeUSD + volumeUSD
        })
        return accum
      }, Promise.resolve({} as { [key: number]: ChartDayData }))

    return Object.values(chartData)
  } catch (e) {
    console.error(e)
    return []
  }
}
