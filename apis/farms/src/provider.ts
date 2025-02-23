import { ChainId } from '@pancakeswap/chains'
import { createPublicClient, http, PublicClient } from 'viem'
import { klaytn, klaytnBaobab } from 'viem/chains'

const requireCheck = [KLAYTN_NODE, KLAYTN_TESTNET_NODE, NODE_REAL_SUBGRAPH_API_KEY]

requireCheck.forEach((node) => {
  if (!node) {
    throw new Error('Missing env var')
  }
})

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

export const viemProviders = ({ chainId }: { chainId?: ChainId }): PublicClient => {
  switch (chainId) {
    case ChainId.KLAYTN:
      return klaytnClient
    case ChainId.KLAYTN_TESTNET:
      return klaytnTestnetClient
    default:
      return klaytnClient
  }
}
