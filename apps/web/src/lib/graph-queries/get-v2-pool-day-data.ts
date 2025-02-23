import request, { gql } from 'graphql-request'
import { subgraphUrls } from 'lib/graph-queries/const'
import { PoolDayDataV2 } from 'lib/graph-queries/types'

export const getV2PoolDayData = async (poolAddress: string, { length = 30 } = {}): Promise<PoolDayDataV2[]> => {
  const document = gql`
    query ($first: Int, $address: Bytes!) {
      pairDayDatas(first: $first, where: { pairAddress: $address }, orderBy: date, orderDirection: desc) {
        date
        dailyVolumeUSD
        reserveUSD
        dailyTxns
      }
    }
  `

  const { pairDayDatas } = await request(subgraphUrls.v2Exchange, document, { first: length, address: poolAddress })

  return pairDayDatas
    .map(({ date, dailyVolumeUSD, reserveUSD, dailyTxns }) => ({
      timestamp: date * 1000,
      volumeUSD: +dailyVolumeUSD,
      tvlUSD: +reserveUSD,
      txCount: +dailyTxns,
    }))
    .sort((a, b) => a.timestamp - b.timestamp)
}
