import request, { gql } from 'graphql-request'
import { subgraphUrls } from 'lib/graph-queries/const'
import { PoolDayDataV3 } from 'lib/graph-queries/types'

export const getV3PoolDayData = async (poolAddress: string, { length = 30 } = {}): Promise<PoolDayDataV3> => {
  const document = gql`
    query ($first: Int, $address: Bytes!) {
      poolDayDatas(first: $first, where: { pool: $address }, orderBy: date, orderDirection: desc) {
        date
        volumeUSD
        tvlUSD
        txCount
        feesUSD
        protocolFeesUSD
      }
    }
  `

  const { poolDayDatas } = await request(subgraphUrls.v3Exchange, document, { first: length, address: poolAddress })

  return poolDayDatas.map(({ date, volumeUSD, tvlUSD, txCount, feesUSD, protocolFeesUSD }) => ({
    timestamp: date * 1000,
    volumeUSD: +volumeUSD,
    tvlUSD: +tvlUSD,
    txCount: +txCount,
    feeUSD: +feesUSD,
    protocolFeeUSD: +protocolFeesUSD,
  }))
}
