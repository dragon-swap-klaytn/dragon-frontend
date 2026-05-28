import request, { gql } from 'graphql-request'
import { subgraphUrls } from 'lib/graph-queries/const'
import { fetchChartDataWithAddress, mapPairDayData } from 'views/Dashboard/helpers'
import { V2TokenChartEntry } from 'views/Dashboard/types'

const getPoolChartData = async (
  skip: number,
  address: string,
): Promise<{ data?: V2TokenChartEntry[]; error: boolean }> => {
  if (address === 'undefined') return { error: true }

  try {
    const query = gql`
      query pairStats_collection($startTime: Timestamp!, $skip: Int!, $address: String!) {
        pairStats_collection(
          first: 1000
          skip: $skip
          interval: "day"
          where: { pair: $address, timestamp_gt: $startTime }
          orderBy: timestamp
          orderDirection: asc
        ) {
          timestamp
          dailyVolumeUSD
          reserveUSD
        }
      }
    `

    const { pairStats_collection: pairStats } = await request<{
      pairStats_collection: { timestamp: string | number; dailyVolumeUSD: string; reserveUSD: string }[]
    }>(subgraphUrls.v2Exchange, query, {
      // Timestamp scalar is microseconds since epoch, passed as a string (the server rejects numeric literals)
      startTime: String(145315220 * 1_000_000),
      skip,
      address,
    })
    // Convert microseconds back to seconds so downstream helpers work unchanged
    const data = pairStats
      ?.map((row) => ({
        date: Math.floor(Number(row.timestamp) / 1_000_000),
        dailyVolumeUSD: row.dailyVolumeUSD,
        reserveUSD: row.reserveUSD,
      }))
      .map(mapPairDayData)
    return { data, error: false }
  } catch (error) {
    console.error('Failed to fetch pool chart data', error)
    return { error: true }
  }
}

export default async function fetchPoolChartData(address: string) {
  return fetchChartDataWithAddress(getPoolChartData, address)
}
