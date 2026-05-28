import request, { gql } from 'graphql-request'
import { subgraphUrls } from 'lib/graph-queries/const'
import { PoolDayDataV3 } from 'lib/graph-queries/types'

export const getV3PoolDayData = async (poolAddress: string, { length = 30 } = {}): Promise<PoolDayDataV3[]> => {
  const document = gql`
    query ($first: Int, $address: String!) {
      poolStats_collection(
        first: $first
        interval: "day"
        where: { pool: $address }
        orderBy: timestamp
        orderDirection: desc
      ) {
        timestamp
        volumeUSD
        tvlUSD
        txCount
        feesUSD
        protocolFeesUSD
      }
    }
  `

  const { poolStats_collection: poolStats } = await request(
    subgraphUrls.v3Exchange,
    document,
    { first: length, address: poolAddress },
    {
      'X-DS-User-Agent': 'dgswap-frontend',
    },
  )

  return poolStats
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
