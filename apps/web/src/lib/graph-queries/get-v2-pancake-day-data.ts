import request, { gql } from 'graphql-request'
import { subgraphUrls } from 'lib/graph-queries/const'
import { PancakeDayDataV2 } from 'lib/graph-queries/types'

export const getV2PancakeDayData = async ({ length = 30 } = {}): Promise<PancakeDayDataV2[]> => {
  const document = gql`
    query ($first: Int) {
      protocolStats_collection(first: $first, interval: "day", orderBy: timestamp, orderDirection: desc) {
        timestamp
        dailyVolumeUSD
        totalLiquidityUSD
        totalTransactions
      }
    }
  `

  const { protocolStats_collection: protocolStats } = await request(
    subgraphUrls.v2Exchange,
    document,
    { first: length },
    {
      'X-DS-User-Agent': 'dgswap-frontend',
    },
  )

  return protocolStats
    .map(({ timestamp, dailyVolumeUSD, totalLiquidityUSD, totalTransactions }) => ({
      // Timestamp scalar is microseconds since epoch; convert to ms
      timestamp: Number(timestamp) / 1000,
      volumeUSD: +dailyVolumeUSD,
      tvlUSD: +totalLiquidityUSD,
      txCount: +totalTransactions,
    }))
    .sort((a, b) => a.timestamp - b.timestamp)
}
