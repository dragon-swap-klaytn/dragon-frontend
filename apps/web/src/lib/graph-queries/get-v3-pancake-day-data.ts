import request, { gql } from 'graphql-request'
import { subgraphUrls } from 'lib/graph-queries/const'
import { PancakeDayDataV3 } from 'lib/graph-queries/types'

export const getV3PancakeDayData = async ({ length = 30 } = {}): Promise<PancakeDayDataV3[]> => {
  const document = gql`
    query ($first: Int) {
      protocolStats_collection(first: $first, interval: "day", orderBy: timestamp, orderDirection: desc) {
        timestamp
        volumeUSD
        tvlUSD
        txCount
        feesUSD
        protocolFeesUSD
      }
    }
  `

  const { protocolStats_collection: protocolStats } = await request(
    subgraphUrls.v3Exchange,
    document,
    { first: length },
    {
      'X-DS-User-Agent': 'dgswap-frontend',
    },
  )

  return protocolStats
    .map(({ timestamp, volumeUSD, tvlUSD, txCount, feesUSD, protocolFeesUSD }) => ({
      // Timestamp scalar is microseconds since epoch; convert to ms
      timestamp: Number(timestamp) / 1000,
      volumeUSD: +volumeUSD,
      tvlUSD: +tvlUSD,
      txCount: +txCount,
      feeUSD: +feesUSD,
      protocolFeeUSD: +protocolFeesUSD,
    }))
    .sort((a, b) => a.timestamp - b.timestamp)
}
