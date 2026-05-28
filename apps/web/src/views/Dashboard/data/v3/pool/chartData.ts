import BigNumber from 'bignumber.js'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import weekOfYear from 'dayjs/plugin/weekOfYear'

import request, { gql } from 'graphql-request'
import { subgraphUrls } from 'lib/graph-queries/const'
import { V3PoolChartEntry } from 'views/Dashboard/types'

// format dayjs with the libraries that we need
dayjs.extend(utc)
dayjs.extend(weekOfYear)
const ONE_DAY_UNIX = 24 * 60 * 60

const POOL_CHART = gql`
  query poolStats_collection($startTime: Timestamp!, $skip: Int!, $address: String!) {
    poolStats_collection(
      first: 1000
      skip: $skip
      interval: "day"
      where: { pool: $address, timestamp_gt: $startTime }
      orderBy: timestamp
      orderDirection: asc
    ) {
      timestamp
      volumeUSD
      tvlUSD
      feesUSD
      protocolFeesUSD
      pool {
        feeTier
      }
    }
  }
`

interface ChartResults {
  poolStats_collection: {
    timestamp: string | number
    volumeUSD: string
    tvlUSD: string
    feesUSD: string
    protocolFeesUSD: string
    pool: {
      feeTier: string
    }
  }[]
}

export async function fetchPoolChartData(address: string) {
  let data: {
    date: number
    volumeUSD: string
    tvlUSD: string
    feesUSD: string
    protocolFeesUSD: string
    pool: {
      feeTier: string
    }
  }[] = []
  const startTimestamp = 1619170975
  const endTimestamp = dayjs.utc().unix()

  let error = false
  let skip = 0
  let allFound = false

  try {
    while (!allFound) {
      // eslint-disable-next-line no-await-in-loop
      const chartData = await request<ChartResults>(subgraphUrls.v3Exchange, POOL_CHART, {
        address,
        // Timestamp scalar is microseconds since epoch, passed as a string (the server rejects numeric literals)
        startTime: String(startTimestamp * 1_000_000),
        skip,
      })

      if (chartData.poolStats_collection.length > 0) {
        skip += 1000
        if (chartData.poolStats_collection.length < 1000 || error) {
          allFound = true
        }
        if (chartData.poolStats_collection) {
          // Convert microseconds back to seconds so downstream gap-fill logic works unchanged
          data = data.concat(
            chartData.poolStats_collection.map((row) => ({
              date: Math.floor(Number(row.timestamp) / 1_000_000),
              volumeUSD: row.volumeUSD,
              tvlUSD: row.tvlUSD,
              feesUSD: row.feesUSD,
              protocolFeesUSD: row.protocolFeesUSD,
              pool: row.pool,
            })),
          )
        }
      }
    }
  } catch (e) {
    console.error(e)
    error = true
  }

  if (data) {
    const formattedExisting = data.reduce((accum: { [date: number]: V3PoolChartEntry }, dayData) => {
      const roundedDate = parseInt((dayData.date / ONE_DAY_UNIX).toFixed(0))
      const feePercent = parseFloat(dayData.pool.feeTier) / 10000
      const tvlAdjust = dayData?.volumeUSD ? parseFloat(dayData.volumeUSD) * feePercent : 0

      // eslint-disable-next-line no-param-reassign
      accum[roundedDate] = {
        date: dayData.date,
        volumeUSD: parseFloat(dayData.volumeUSD),
        totalValueLockedUSD: parseFloat(dayData.tvlUSD) - tvlAdjust,
        feesUSD: new BigNumber(dayData.feesUSD).minus(dayData.protocolFeesUSD).toNumber(),
      }
      return accum
    }, {})

    const firstEntry = formattedExisting[parseInt(Object.keys(formattedExisting)[0])]

    // fill in empty days ( there will be no day datas if no trades made that day )
    let timestamp = firstEntry?.date ?? startTimestamp
    let latestTvl = firstEntry?.totalValueLockedUSD ?? 0
    while (timestamp < endTimestamp - ONE_DAY_UNIX) {
      const nextDay = timestamp + ONE_DAY_UNIX
      const currentDayIndex = parseInt((nextDay / ONE_DAY_UNIX).toFixed(0))
      if (!Object.keys(formattedExisting).includes(currentDayIndex.toString())) {
        formattedExisting[currentDayIndex] = {
          date: nextDay,
          volumeUSD: 0,
          totalValueLockedUSD: latestTvl,
          feesUSD: 0,
        }
      } else {
        latestTvl = formattedExisting[currentDayIndex].totalValueLockedUSD
      }
      timestamp = nextDay
    }

    const dateMap = Object.keys(formattedExisting).map((key) => {
      return formattedExisting[parseInt(key)]
    })

    return {
      data: dateMap,
      error: false,
    }
  }
  return {
    data: undefined,
    error,
  }
}
