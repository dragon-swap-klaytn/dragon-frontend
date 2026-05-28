import { ChainId, SUBGRAPH_START_BLOCK } from '@pancakeswap/chains'
import request, { gql } from 'graphql-request'
import { subgraphUrls } from 'lib/graph-queries/const'
import { fetchChartDataWithAddress, mapDayData } from 'views/Dashboard/helpers'

async function getTokenChartData(skip: number, address: string) {
  try {
    const query = gql`
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
          dailyVolumeUSD
          totalLiquidityUSD
        }
      }
    `
    const { tokenStats_collection: tokenStats } = await request<{
      tokenStats_collection: { timestamp: string | number; dailyVolumeUSD: string; totalLiquidityUSD: string }[]
    }>(subgraphUrls.v2Exchange, query, {
      // Timestamp scalar is microseconds since epoch, passed as a string (the server rejects numeric literals)
      startTime: String(SUBGRAPH_START_BLOCK[ChainId.KLAYTN] * 1_000_000),
      skip,
      address,
    })

    // Convert microseconds back to seconds so downstream helpers work unchanged
    const data = tokenStats
      .map((row) => ({
        date: Math.floor(Number(row.timestamp) / 1_000_000),
        dailyVolumeUSD: row.dailyVolumeUSD,
        totalLiquidityUSD: row.totalLiquidityUSD,
      }))
      .map(mapDayData)
    return { data, error: false }
  } catch (error) {
    console.error('Failed to fetch token chart data', error)
    return { error: true }
  }
}

export default async function fetchTokenChartData(address: string) {
  return fetchChartDataWithAddress(getTokenChartData, address)
}
