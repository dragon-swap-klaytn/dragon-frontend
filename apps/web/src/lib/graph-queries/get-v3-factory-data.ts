import { gql, request } from 'graphql-request'
import { USDT_JPYC_V3_POOL_ADDRESS, subgraphUrls } from 'lib/graph-queries/const'
import { FactoryDataV3Raw } from 'lib/graph-queries/types'

type FactoryQuery = {
  factories: {
    poolCount: string
    txCount: string
    totalVolumeUSD: string
    totalFeesUSD: string
    totalProtocolFeesUSD: string
    totalValueLockedUSD: string
  }[]
  bundles: { ethPriceUSD: string }[]
  pool: { totalValueLockedETH: string; totalValueLockedETHUntracked: string } | null
}

export const getV3FactoryData = async ({
  blockNumber,
}: {
  blockNumber?: number // Optional block number for fetching historical data.
} = {}): Promise<FactoryDataV3Raw> => {
  const block = blockNumber === undefined ? '' : 'block: { number: $blockNumber }'
  const document = gql`
    query ($poolId: ID!${block ? ', $blockNumber: Int!' : ''}) {
      factories(first: 1, ${block}) {
        poolCount
        txCount
        totalVolumeUSD
        totalFeesUSD
        totalProtocolFeesUSD
        totalValueLockedUSD
      }
      bundles(first: 1, ${block}) {
        ethPriceUSD
      }
      pool(id: $poolId, ${block}) {
        totalValueLockedETH
        totalValueLockedETHUntracked
      }
    }
  `

  const variables = { poolId: USDT_JPYC_V3_POOL_ADDRESS, blockNumber }
  const { factories, bundles, pool } = await request<FactoryQuery>(subgraphUrls.v3Exchange, document, variables, {
    'X-DS-User-Agent': 'dgswap-frontend',
  })

  const item = factories[0]
  const bundle = bundles[0]
  // Factory TVL converts the sum of pool contributions at this block's KAIA price.
  const jpycTvlAdjustment =
    pool && bundle ? (+pool.totalValueLockedETHUntracked - +pool.totalValueLockedETH) * +bundle.ethPriceUSD : 0

  return {
    poolCount: +item.poolCount,
    txCount: +item.txCount,
    volumeUSD: +item.totalVolumeUSD,
    tvlUSD: +item.totalValueLockedUSD + jpycTvlAdjustment,
    feeUSD: +item.totalFeesUSD,
    protocolFeeUSD: +item.totalProtocolFeesUSD,
  }
}
