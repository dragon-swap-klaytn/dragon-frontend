import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import request, { gql } from 'graphql-request'
import { subgraphUrls } from 'lib/graph-queries/const'
import { V3TokenChartEntry } from 'views/Dashboard/types'

// format dayjs with the libraries that we need
dayjs.extend(utc)
dayjs.extend(weekOfYear)
const ONE_DAY_UNIX = 24 * 60 * 60

const TOKEN_CHART = gql`
  query tokenStats_collection($startTime: Timestamp!, $skip: Int!, $address: String!) {
    tokenStats_collection(
      first: 100
      skip: $skip
      interval: "day"
      where: { token: $address, timestamp_gt: $startTime }
      orderBy: timestamp
      orderDirection: asc
    ) {
      timestamp
      volumeUSD
      totalValueLockedUSD
    }
  }
`

interface ChartResults {
  tokenStats_collection: {
    timestamp: string | number
    volumeUSD: string
    totalValueLockedUSD: string
  }[]
}

export async function fetchTokenChartData(address: string) {
  let data: {
    date: number
    volumeUSD: string
    totalValueLockedUSD: string
  }[] = []
  const startTimestamp = dayjs.utc().subtract(1, 'month').unix()
  const endTimestamp = dayjs.utc().unix()

  let error = false
  let skip = 0
  let allFound = false

  try {
    while (!allFound) {
      // eslint-disable-next-line no-await-in-loop
      const chartResData = await request<ChartResults>(subgraphUrls.v3Exchange, TOKEN_CHART, {
        // Timestamp scalar is microseconds since epoch, passed as a string (the server rejects numeric literals)
        startTime: String(startTimestamp * 1_000_000),
        skip,
        address,
      })

      if (chartResData.tokenStats_collection.length > 0) {
        skip += 100

        if (chartResData) {
          // Convert microseconds back to seconds so downstream gap-fill logic works unchanged
          data = data.concat(
            chartResData.tokenStats_collection.map((row) => ({
              date: Math.floor(Number(row.timestamp) / 1_000_000),
              volumeUSD: row.volumeUSD,
              totalValueLockedUSD: row.totalValueLockedUSD,
            })),
          )
        }

        if (chartResData.tokenStats_collection.length < 100 || error) {
          allFound = true
        }
      }
    }
  } catch {
    error = true
  }

  if (data) {
    const formattedExisting = data.reduce((accum: { [date: number]: V3TokenChartEntry }, dayData) => {
      const roundedDate = parseInt((dayData.date / ONE_DAY_UNIX).toFixed(0))
      // eslint-disable-next-line no-param-reassign
      accum[roundedDate] = {
        date: dayData.date,
        volumeUSD: parseFloat(dayData.volumeUSD),
        totalValueLockedUSD: parseFloat(dayData.totalValueLockedUSD),
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
