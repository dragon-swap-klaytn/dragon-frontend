import request, { gql } from 'graphql-request'
import { subgraphUrls } from 'lib/graph-queries/const'
import { TokenDayDataV3 } from 'lib/graph-queries/types'

export const getV3TokenDayData = async (poolAddress: string, { length = 30 } = {}): Promise<TokenDayDataV3[]> => {
  const document = gql`
    query ($first: Int, $address: String!) {
      tokenStats_collection(
        first: $first
        interval: "day"
        where: { token: $address }
        orderBy: timestamp
        orderDirection: desc
      ) {
        timestamp
        volumeUSD
        totalValueLockedUSD
        feesUSD
        protocolFeesUSD
        open
        high
        low
        close
      }
    }
  `

  const { tokenStats_collection: tokenStats } = await request(
    subgraphUrls.v3Exchange,
    document,
    { first: length, address: poolAddress },
    {
      'X-DS-User-Agent': 'dgswap-frontend',
    },
  )

  return tokenStats
    .map(({ timestamp, volumeUSD, totalValueLockedUSD, feesUSD, protocolFeesUSD, open, high, low, close }) => ({
      // Timestamp scalar is microseconds since epoch; convert to ms
      timestamp: Number(timestamp) / 1000,
      volumeUSD: +volumeUSD,
      tvlUSD: +totalValueLockedUSD,
      feeUSD: +feesUSD,
      protocolFeeUSD: +protocolFeesUSD,
      ohlc: [+open, +high, +low, +close],
    }))
    .sort((a, b) => a.timestamp - b.timestamp)
}
