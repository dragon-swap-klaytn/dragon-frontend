import request, { gql } from 'graphql-request'
import { subgraphUrls } from 'lib/graph-queries/const'
import { PancakeDayDataV3 } from 'lib/graph-queries/types'

export const getV3PancakeDayData = async ({ length = 30 } = {}) => {
  const document = gql`
    query ($first: Int) {
      pancakeDayDatas(first: $first, orderBy: date, orderDirection: desc) {
        date
        volumeUSD
        tvlUSD
        txCount
        feesUSD
        protocolFeesUSD
      }
    }
  `

  const { pancakeDayDatas } = await request(subgraphUrls.v3Exchange, document, { first: length })

  return pancakeDayDatas.map(
    ({ date, volumeUSD, tvlUSD, txCount, feesUSD, protocolFeesUSD }) =>
      ({
        timestamp: date * 1000,
        volumeUSD: +volumeUSD,
        tvlUSD: +tvlUSD,
        txCount: +txCount,
        feeUSD: +feesUSD,
        protocolFeeUSD: +protocolFeesUSD,
      } as PancakeDayDataV3),
  )
}
