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
      query pairDayDatas($startTime: Int!, $skip: Int!, $address: Bytes!) {
        pairDayDatas(
          first: 1000
          skip: $skip
          where: { pairAddress: $address, date_gt: $startTime }
          orderBy: date
          orderDirection: asc
        ) {
          date
          dailyVolumeUSD
          reserveUSD
        }
      }
    `

    const { pairDayDatas } = await request(subgraphUrls.v2Exchange, query, { startTime: 145315220, skip, address })
    const data = pairDayDatas?.map(mapPairDayData)
    return { data, error: false }
  } catch (error) {
    console.error('Failed to fetch pool chart data', error)
    return { error: true }
  }
}

export default async function fetchPoolChartData(address: string) {
  return fetchChartDataWithAddress(getPoolChartData, address)
}
