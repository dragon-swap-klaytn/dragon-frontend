import request, { gql } from 'graphql-request'
import { subgraphUrls } from 'lib/graph-queries/const'
import { PancakeDayDataV2 } from 'lib/graph-queries/types'

export const getV2PancakeDayData = async ({ length = 30 } = {}) => {
  const document = gql`
    query ($first: Int) {
      pancakeDayDatas(first: $first, orderBy: date, orderDirection: desc) {
        date
        dailyVolumeUSD
        totalLiquidityUSD
        totalTransactions
      }
    }
  `

  const { pancakeDayDatas } = await request(subgraphUrls.v2Exchange, document, { first: length })

  return pancakeDayDatas.map(
    ({ date, dailyVolumeUSD, totalLiquidityUSD, totalTransactions }) =>
      ({
        timestamp: date * 1000,
        volumeUSD: +dailyVolumeUSD,
        tvlUSD: +totalLiquidityUSD,
        txCount: +totalTransactions,
      } as PancakeDayDataV2),
  )
}
