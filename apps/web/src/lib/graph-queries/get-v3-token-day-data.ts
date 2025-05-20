import request, { gql } from 'graphql-request'
import { subgraphUrls } from 'lib/graph-queries/const'
import { TokenDayDataV3 } from 'lib/graph-queries/types'

export const getV3TokenDayData = async (poolAddress: string, { length = 30 } = {}): Promise<TokenDayDataV3[]> => {
  const document = gql`
    query ($first: Int, $address: Bytes!) {
      tokenDayDatas(first: $first, where: { token: $address }, orderBy: date, orderDirection: desc) {
        date
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

  const { tokenDayDatas } = await request(
    subgraphUrls.v3Exchange,
    document,
    { first: length, address: poolAddress },
    {
      'X-DS-User-Agent': 'dgswap-frontend',
    },
  )

  return tokenDayDatas
    .map(({ date, volumeUSD, totalValueLockedUSD, feesUSD, protocolFeesUSD, open, high, low, close }) => ({
      timestamp: date * 1000,
      volumeUSD: +volumeUSD,
      tvlUSD: +totalValueLockedUSD,
      feeUSD: +feesUSD,
      protocolFeeUSD: +protocolFeesUSD,
      ohlc: [+open, +high, +low, +close],
    }))
    .sort((a, b) => a.timestamp - b.timestamp)
}
