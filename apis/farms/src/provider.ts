import { ChainId } from "@pancakeswap/chains";
import { createPublicClient, http, PublicClient } from "viem";
import { bsc, bscTestnet, goerli, klaytn, klaytnBaobab, mainnet } from "viem/chains";

const requireCheck = [
  ETH_NODE,
  GOERLI_NODE,
  BSC_NODE,
  BSC_TESTNET_NODE,
  KLAYTN_NODE,
  KLAYTN_TESTNET_NODE,
  NODE_REAL_SUBGRAPH_API_KEY,
]

requireCheck.forEach((node) => {
  if (!node) {
    throw new Error('Missing env var')
  }
})

const mainnetClient = createPublicClient({
  chain: mainnet,
  transport: http(ETH_NODE),
  batch: {
    multicall: {
      batchSize: 1024 * 200,
      wait: 16,
    },
  },
  pollingInterval: 6_000,
})

export const bscClient: PublicClient = createPublicClient({
  chain: bsc,
  transport: http(BSC_NODE),
  batch: {
    multicall: {
      batchSize: 1024 * 200,
      wait: 16,
    },
  },
  pollingInterval: 6_000,
})

export const bscTestnetClient: PublicClient = createPublicClient({
  chain: bscTestnet,
  transport: http(BSC_TESTNET_NODE),
  batch: {
    multicall: {
      batchSize: 1024 * 200,
      wait: 16,
    },
  },
  pollingInterval: 6_000,
})

const goerliClient = createPublicClient({
  chain: goerli,
  transport: http(GOERLI_NODE),
  batch: {
    multicall: {
      batchSize: 1024 * 200,
      wait: 16,
    },
  },
  pollingInterval: 6_000,
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
    case ChainId.ETHEREUM:
      return mainnetClient
    case ChainId.BSC:
      return bscClient
    case ChainId.BSC_TESTNET:
      return bscTestnetClient
    case ChainId.GOERLI:
      return goerliClient
    case ChainId.KLAYTN:
      return klaytnClient
    case ChainId.KLAYTN_TESTNET:
      return klaytnTestnetClient
    default:
      return bscClient
  }
}
