import { ChainId, SUBGRAPH_START_BLOCK } from '@pancakeswap/chains'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import request, { gql } from 'graphql-request'
import { subgraphUrls } from 'lib/graph-queries/const'
import { getBlocksFromTimestamps } from 'utils/getBlocksFromTimestamps'
import { ONE_DAY_SECONDS } from 'views/Dashboard/constants'
import { PriceChartEntry } from 'views/Dashboard/types'

// format dayjs with the libraries that we need
dayjs.extend(utc)
dayjs.extend(weekOfYear)

export const PRICES_BY_BLOCK = (tokenAddress: string, blocks: any) => {
  let queryString = 'query blocks {'
  queryString += blocks.map(
    (block: any) => `
      t${block.timestamp}:token(id:"${tokenAddress}", block: { number: ${block.number} }) {
        derivedETH
      }
    `,
  )
  queryString += ','
  queryString += blocks.map(
    (block: any) => `
      b${block.timestamp}: bundle(id:"1", block: { number: ${block.number} }) {
        ethPriceUSD
      }
    `,
  )

  queryString += '}'
  return gql`
    ${queryString}
  `
}

const DAY_PAIR_PRICE_CHART = (timestamps: number[] | string[]) => {
  let queryString = 'query poolHourDatas($address: String) {'
  timestamps.forEach((d) => {
    queryString += `
      t${d}:poolDayDatas(
        first: 1
        skip: 0
        where: { pool: $address, date_gte: ${d} }
        orderBy: date
        orderDirection: asc
      ) {
        date
        high
        low
        open
        close
      }
    `
  })
  queryString += '}'
  return gql`
    ${queryString}
  `
}

const DAY_PAIR_MAX = (timestamp: number | string) => {
  const queryString = `query maxPrice($address: String) {
      poolDayDatas(
        first: 1
        skip: 0
        where: { pool: $address, date_gte: ${timestamp} }
        orderBy: high
        orderDirection: desc
      ) {
        high
      }
  }`
  return gql`
    ${queryString}
  `
}

const DAY_PAIR_MIN = (timestamp: number | string) => {
  const queryString = `query minPrice($address: String) {
     poolDayDatas(
        first: 1
        skip: 0
        where: { pool: $address, date_gte: ${timestamp},low_gt: 0 }
        orderBy: low
        orderDirection: asc
      ) {
        low
      }
  }`
  return gql`
    ${queryString}
  `
}

const HOUR_PAIR_PRICE_CHART = (timestamps: number[] | string[]) => {
  let queryString = 'query poolHourDatas($address: String) {'
  timestamps.forEach((d) => {
    queryString += `
      t${d}:poolHourDatas(
        first: 1
        skip: 0
        where: { pool: $address, periodStartUnix: ${d} }
        orderBy: periodStartUnix
        orderDirection: asc
      ) {
        periodStartUnix
        high
        low
        open
        close
      }
    `
  })
  queryString += '}'
  return gql`
    ${queryString}
  `
}

const HOUR_PRICE_CHART = gql`
  query tokenHourDatas($startTime: Int!, $skip: Int!, $address: String!) {
    tokenHourDatas(
      first: 100
      skip: $skip
      where: { token: $address, periodStartUnix_gt: $startTime }
      orderBy: periodStartUnix
      orderDirection: asc
    ) {
      periodStartUnix
      high
      low
      open
      close
    }
  }
`
const HOUR_PRICE_MIN = (timestamp: number | string) => gql`
  query minPrice( $address: String!) {
    poolHourDatas(
      first: 1
      where: { pool: $address, periodStartUnix: ${timestamp}, low_gt: 0 }
      orderBy: low
      orderDirection: asc
    ) {
      low
    }
  }
`

const HOUR_PRICE_MAX = (timestamp: number | string) => gql`
  query maxPrice( $address: String!) {
    poolHourDatas(
      first: 1
      where: { pool: $address, periodStartUnix: ${timestamp} }
      orderBy: high
      orderDirection: desc
    ) {
      high
    }
  }
`

interface TokenHourDatas {
  periodStartUnix: number
  high: string
  low: string
  open: string
  close: string
}

interface PriceResults {
  tokenHourDatas: TokenHourDatas[]
}

type PriceResultsForPairPriceChartResult = Record<string, TokenHourDatas[]>
type PairPriceMinMAxResults = Record<string, TokenHourDatas>

export async function fetchTokenPriceData(address: string, interval: number, startTimestamp: number) {
  // start and end bounds
  try {
    const endTimestamp = dayjs.utc().unix()

    if (!startTimestamp) {
      console.error('Error constructing price start timestamp')
      return {
        data: undefined,
        error: false,
      }
    }

    // create an array of hour start times until we reach current hour
    const timestamps: number[] = []
    let time = startTimestamp
    while (time <= endTimestamp) {
      timestamps.push(time)
      time += interval
    }

    // backout if invalid timestamp format
    if (timestamps.length === 0) {
      return {
        data: undefined,
        error: false,
      }
    }

    // fetch blocks based on timestamp
    const blocks = (await getBlocksFromTimestamps(timestamps, 'asc', 500)).filter(
      (d) => d.number >= SUBGRAPH_START_BLOCK[ChainId.KLAYTN],
    )
    if (!blocks || blocks.length === 0) {
      console.error('Error fetching blocks')
      return {
        data: undefined,
        error: false,
      }
    }

    let data: {
      periodStartUnix?: number
      date?: number
      high: string
      low: string
      open: string
      close: string
    }[] = []

    let skip = 0
    let allFound = false

    while (!allFound) {
      // eslint-disable-next-line no-await-in-loop
      const priceData = await request<PriceResults>(subgraphUrls.v3Exchange, HOUR_PRICE_CHART, {
        address,
        startTime: startTimestamp,
        skip,
      })

      if (priceData?.tokenHourDatas?.length > 0) {
        skip += 100
        if (priceData?.tokenHourDatas?.length < 100) {
          allFound = true
        }
        if (priceData) {
          data = data.concat(priceData.tokenHourDatas)
        }
      }
    }

    const formattedHistory: PriceChartEntry[] = data.map((d) => {
      return {
        time: d?.periodStartUnix || d?.date || 0,
        open: parseFloat(d.open),
        close: parseFloat(d.close),
        high: parseFloat(d.high),
        low: parseFloat(d.low),
      }
    })

    return {
      data: formattedHistory,
      error: false,
    }
  } catch (e) {
    console.error(e)
    return {
      data: undefined,
      error: true,
    }
  }
}

export async function fetchPairPriceChartTokenData(address: string, interval: number, startTimestamp: number) {
  const isDay = interval === ONE_DAY_SECONDS
  // start and end bounds
  let averagePrice = 0
  try {
    const endTimestamp = dayjs.utc().unix()

    if (!startTimestamp) {
      console.error('Error constructing price start timestamp')
      return {
        data: [],
        error: false,
      }
    }

    // create an array of hour start times until we reach current hour
    const timestamps: number[] = []
    let time = startTimestamp
    while (time <= endTimestamp) {
      timestamps.push(time)
      time += interval
    }

    // backout if invalid timestamp format
    if (timestamps.length === 0) {
      return {
        data: [],
        error: false,
      }
    }

    // fetch blocks based on timestamp
    const blocks = (await getBlocksFromTimestamps(timestamps, 'asc', 500)).filter(
      (d) => d.number >= SUBGRAPH_START_BLOCK[ChainId.KLAYTN],
    )

    if (!blocks || blocks.length === 0) {
      console.error('Error fetching blocks')
      return {
        data: [],
        error: false,
      }
    }

    let data: {
      periodStartUnix?: number
      date?: number
      high: string
      low: string
      open: string
      close: string
    }[] = []

    // eslint-disable-next-line no-await-in-loop

    const priceData = await request<PriceResultsForPairPriceChartResult>(
      subgraphUrls.v3Exchange,
      isDay ? DAY_PAIR_PRICE_CHART(timestamps) : HOUR_PAIR_PRICE_CHART(timestamps),
      {
        address,
      },
    )

    const maxQueryPrice = isDay
      ? (
          await request<PairPriceMinMAxResults>(subgraphUrls.v3Exchange, DAY_PAIR_MAX(blocks?.[0].timestamp), {
            address,
          })
        )?.poolDayDatas?.[0]?.high
      : (
          await request<PairPriceMinMAxResults>(subgraphUrls.v3Exchange, HOUR_PRICE_MAX(blocks?.[0].timestamp), {
            address,
          })
        )?.poolHourDatas?.[0]?.high
    const minQueryPrice = isDay
      ? (
          await request<PairPriceMinMAxResults>(subgraphUrls.v3Exchange, DAY_PAIR_MIN(blocks?.[0].timestamp), {
            address,
          })
        )?.poolDayDatas?.[0]?.low
      : (
          await request<PairPriceMinMAxResults>(subgraphUrls.v3Exchange, HOUR_PRICE_MIN(blocks?.[0].timestamp), {
            address,
          })
        )?.poolHourDatas?.[0]?.low

    if (Object.keys(priceData)?.length > 0) {
      if (priceData) {
        Object.values(priceData).forEach((d) => {
          data = data.concat(d)
        })
      }
    }

    const formattedHistory = data.map((d) => {
      const high = parseFloat(d.high)
      const low = parseFloat(d.low)
      const close = parseFloat(d.close)
      averagePrice += close
      return {
        time: d?.periodStartUnix || d?.date,
        open: parseFloat(d.open),
        close,
        high,
        low,
      }
    })
    averagePrice /= formattedHistory.length
    return {
      data: formattedHistory,
      maxPrice: parseFloat(maxQueryPrice),
      minPrice: parseFloat(minQueryPrice),
      averagePrice,
      error: false,
    }
  } catch (e) {
    console.error(e)
    return {
      data: [],
      error: true,
    }
  }
}
