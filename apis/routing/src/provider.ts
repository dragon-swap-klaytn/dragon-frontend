import { ChainId, getV3Subgraphs } from '@pancakeswap/chains'
import { OnChainProvider, SubgraphProvider } from '@pancakeswap/smart-router/evm'
import { GraphQLClient } from 'graphql-request'
import { createPublicClient, http } from 'viem'
import { klaytn, klaytnBaobab } from 'viem/chains'

import { SupportedChainId } from './constants'

const requireCheck = [KLAYTN_NODE, KLAYTN_TESTNET_NODE, NODE_REAL_SUBGRAPH_API_KEY]
requireCheck.forEach((node) => {
  if (!node) {
    throw new Error('Missing env var')
  }
})

const V3_SUBGRAPHS = getV3Subgraphs()

const klaytnClient = createPublicClient({
  chain: klaytn,
  transport: http(KLAYTN_NODE),
  batch: {
    multicall: {
      batchSize: 1024 * 200,
      wait: 16,
    },
  },
  pollingInterval: 5_000,
})
const klaytnTestnetClient = createPublicClient({
  chain: klaytnBaobab,
  transport: http(KLAYTN_TESTNET_NODE),
  batch: {
    multicall: {
      batchSize: 1024 * 200,
      wait: 16,
    },
  },
  pollingInterval: 5_000,
})
// @ts-ignore
export const viemProviders: OnChainProvider = ({ chainId }: { chainId?: ChainId }) => {
  switch (chainId) {
    case ChainId.KLAYTN:
      return klaytnClient
    case ChainId.KLAYTN_TESTNET:
      return klaytnTestnetClient
    default:
      return klaytnClient
  }
}

export const v3SubgraphClients: Record<SupportedChainId, GraphQLClient> = {
  [ChainId.KLAYTN_TESTNET]: new GraphQLClient(V3_SUBGRAPHS[ChainId.KLAYTN_TESTNET], { fetch }),
  [ChainId.KLAYTN]: new GraphQLClient(V3_SUBGRAPHS[ChainId.KLAYTN], { fetch }),
} as const

export const v3SubgraphProvider: SubgraphProvider = ({ chainId = ChainId.KLAYTN }: { chainId?: ChainId }) => {
  return v3SubgraphClients[chainId as SupportedChainId]
}
