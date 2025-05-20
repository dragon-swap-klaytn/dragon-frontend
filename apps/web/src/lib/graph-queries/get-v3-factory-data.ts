import { gql, request } from 'graphql-request'
import { subgraphUrls } from 'lib/graph-queries/const'
import { FactoryDataV3Raw } from 'lib/graph-queries/types'

export const getV3FactoryData = async ({
  blockNumber,
}: {
  blockNumber?: number // Optional block number for fetching historical data.
} = {}): Promise<FactoryDataV3Raw> => {
  const document = gql`
    query (${blockNumber !== undefined ? '$blockNumber: Int' : ''}) {
      factories(
        first: 1,
        ${blockNumber !== undefined ? 'block: { number: $blockNumber }' : ''}
      ) {
        poolCount
        txCount
        totalVolumeUSD
        totalFeesUSD
        totalProtocolFeesUSD
        totalValueLockedUSD
      }
    }
  `

  // Define query variables safely
  const variables: Record<string, number> = {}
  if (blockNumber !== undefined) {
    variables.blockNumber = blockNumber
  }

  const { factories } = await request(subgraphUrls.v3Exchange, document, variables, {
    'DS-User-Agent': 'dgswap-frontend',
  })

  const item = factories[0]

  return {
    poolCount: +item.poolCount,
    txCount: +item.txCount,
    volumeUSD: +item.totalVolumeUSD,
    tvlUSD: +item.totalValueLockedUSD,
    feeUSD: +item.totalFeesUSD,
    protocolFeeUSD: +item.totalProtocolFeesUSD,
  }
}
