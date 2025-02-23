import { ChainId, SUBGRAPH_START_BLOCK } from '@pancakeswap/chains'
import request, { gql } from 'graphql-request'
import { subgraphUrls } from 'lib/graph-queries/const'
import { fetchChartDataWithAddress, mapDayData } from 'views/Dashboard/helpers'
import { TokenDayDatasResponse } from 'views/Dashboard/types'

async function getTokenChartData(skip: number, address: string) {
  try {
    const query = gql`
      query tokenDayDatas($startTime: Int!, $skip: Int!, $address: String!) {
        tokenDayDatas(
          first: 100
          skip: $skip
          where: { token: $address, date_gt: $startTime }
          orderBy: date
          orderDirection: asc
        ) {
          date
          dailyVolumeUSD
          totalLiquidityUSD
        }
      }
    `
    const { tokenDayDatas } = await request<TokenDayDatasResponse>(subgraphUrls.v2Exchange, query, {
      startTime: SUBGRAPH_START_BLOCK[ChainId.KLAYTN],
      skip,
      address,
    })

    const data = tokenDayDatas.map(mapDayData)
    return { data, error: false }
  } catch (error) {
    console.error('Failed to fetch token chart data', error)
    return { error: true }
  }
}

export default async function fetchTokenChartData(address: string) {
  return fetchChartDataWithAddress(getTokenChartData, address)
}
