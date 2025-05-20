import request, { gql } from 'graphql-request'
import { subgraphUrls } from 'lib/graph-queries/const'
import { TokenDayDataV2 } from 'lib/graph-queries/types'

export const getV2TokenDayData = async (tokenAddress: string, { length = 30 } = {}): Promise<TokenDayDataV2[]> => {
  const document = gql`
    query ($first: Int, $address: Bytes!) {
      tokenDayDatas(first: $first, where: { token: $address }, orderBy: date, orderDirection: desc) {
        date
        dailyVolumeUSD
        totalLiquidityUSD
        dailyTxns
        priceUSD
      }
    }
  `

  const { tokenDayDatas } = await request(
    subgraphUrls.v2Exchange,
    document,
    { first: length, address: tokenAddress },
    {
      'DS-User-Agent': 'dgswap-frontend',
    },
  )

  return tokenDayDatas
    .map(({ date, dailyVolumeUSD, totalLiquidityUSD, dailyTxns, priceUSD }) => ({
      timestamp: date * 1000,
      volumeUSD: +dailyVolumeUSD,
      tvlUSD: +totalLiquidityUSD,
      txCount: +dailyTxns,
      priceUSD: +priceUSD,
    }))
    .sort((a, b) => a.timestamp - b.timestamp)
}
