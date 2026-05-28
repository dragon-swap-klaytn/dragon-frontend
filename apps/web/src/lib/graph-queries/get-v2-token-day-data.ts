import request, { gql } from 'graphql-request'
import { subgraphUrls } from 'lib/graph-queries/const'
import { TokenDayDataV2 } from 'lib/graph-queries/types'

export const getV2TokenDayData = async (tokenAddress: string, { length = 30 } = {}): Promise<TokenDayDataV2[]> => {
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
        dailyVolumeUSD
        totalLiquidityUSD
        dailyTxns
        priceUSD
      }
    }
  `

  const { tokenStats_collection: tokenStats } = await request(
    subgraphUrls.v2Exchange,
    document,
    { first: length, address: tokenAddress },
    {
      'X-DS-User-Agent': 'dgswap-frontend',
    },
  )

  return tokenStats
    .map(({ timestamp, dailyVolumeUSD, totalLiquidityUSD, dailyTxns, priceUSD }) => ({
      // Timestamp scalar is microseconds since epoch; convert to ms
      timestamp: Number(timestamp) / 1000,
      volumeUSD: +dailyVolumeUSD,
      tvlUSD: +totalLiquidityUSD,
      txCount: +dailyTxns,
      priceUSD: +priceUSD,
    }))
    .sort((a, b) => a.timestamp - b.timestamp)
}
