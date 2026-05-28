import request, { gql } from 'graphql-request'
import { subgraphUrls } from 'lib/graph-queries/const'
import { PoolDayDataV2 } from 'lib/graph-queries/types'

export const getV2PoolDayData = async (poolAddress: string, { length = 30 } = {}): Promise<PoolDayDataV2[]> => {
  const document = gql`
    query ($first: Int, $address: String!) {
      pairStats_collection(
        first: $first
        interval: "day"
        where: { pair: $address }
        orderBy: timestamp
        orderDirection: desc
      ) {
        timestamp
        dailyVolumeUSD
        reserveUSD
        dailyTxns
      }
    }
  `

  const { pairStats_collection: pairStats } = await request(
    subgraphUrls.v2Exchange,
    document,
    { first: length, address: poolAddress },
    {
      'X-DS-User-Agent': 'dgswap-frontend',
    },
  )

  return pairStats
    .map(({ timestamp, dailyVolumeUSD, reserveUSD, dailyTxns }) => ({
      // Timestamp scalar is microseconds since epoch; convert to ms
      timestamp: Number(timestamp) / 1000,
      volumeUSD: +dailyVolumeUSD,
      tvlUSD: +reserveUSD,
      txCount: +dailyTxns,
    }))
    .sort((a, b) => a.timestamp - b.timestamp)
}
