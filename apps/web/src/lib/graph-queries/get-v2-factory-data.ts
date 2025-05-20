import { gql, request } from 'graphql-request'
import { subgraphUrls } from 'lib/graph-queries/const'
import { FactoryDataV2Raw } from 'lib/graph-queries/types'

export const getV2FactoryData = async ({
  blockNumber,
}: {
  blockNumber?: number // Optional block number for fetching historical data.
} = {}): Promise<FactoryDataV2Raw> => {
  const document = gql`
    query (${blockNumber !== undefined ? '$blockNumber: Int' : ''}) {
      pancakeFactories(
        first: 1,
        ${blockNumber !== undefined ? 'block: { number: $blockNumber }' : ''}
      ) {
        totalPairs
        totalTransactions
        totalVolumeUSD
        totalLiquidityUSD
      }
    }
  `

  // Define query variables safely
  const variables: Record<string, number> = {}
  if (blockNumber !== undefined) {
    variables.blockNumber = blockNumber
  }

  const { pancakeFactories } = await request(subgraphUrls.v2Exchange, document, variables, {
    'DS-User-Agent': 'dgswap-frontend',
  })

  const item = pancakeFactories[0]

  return {
    poolCount: +item.totalPairs,
    txCount: +item.totalTransactions,
    volumeUSD: +item.totalVolumeUSD,
    tvlUSD: +item.totalLiquidityUSD,
  }
}
