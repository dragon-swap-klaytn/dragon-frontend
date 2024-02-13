import { ChainId } from './chainId'

export const V3_SUBGRAPHS = getV3Subgraphs()

export const V2_SUBGRAPHS = getV2Subgraphs()

export const BLOCKS_SUBGRAPHS = getBlocksSubgraphs()

export const STABLESWAP_SUBGRAPHS = {
  [ChainId.BSC]: 'https://api.thegraph.com/subgraphs/name/pancakeswap/exchange-stableswap',
}

// NOTE [체인설정]_10 : subgraph url 설정
export function getV3Subgraphs() {
  return {
    [ChainId.ETHEREUM]: 'https://api.thegraph.com/subgraphs/name/pancakeswap/exchange-v3-eth',
    [ChainId.GOERLI]: 'https://api.thegraph.com/subgraphs/name/pancakeswap/exchange-v3-goerli',
    [ChainId.BSC]: 'https://api.thegraph.com/subgraphs/name/pancakeswap/exchange-v3-bsc',
    [ChainId.BSC_TESTNET]: 'https://api.thegraph.com/subgraphs/name/pancakeswap/exchange-v3-chapel',
    [ChainId.KLAYTN]: 'https://graph.dgswap.io/subgraphs/name/dragonswap/exchange-v3',
    [ChainId.KLAYTN_TESTNET]: '',
  } satisfies Record<ChainId, string | null>
}

export function getV2Subgraphs() {
  return {
    [ChainId.BSC]: 'https://proxy-worker-api.pancakeswap.com/bsc-exchange',
    [ChainId.ETHEREUM]: 'https://api.thegraph.com/subgraphs/name/pancakeswap/exhange-eth',
    [ChainId.KLAYTN]: 'https://graph.dgswap.io/subgraphs/name/dragonswap/exchange-v2',
    [ChainId.KLAYTN_TESTNET]: '',
  }
}

export function getBlocksSubgraphs() {
  return {
    [ChainId.BSC]: 'https://api.thegraph.com/subgraphs/name/pancakeswap/blocks',
    [ChainId.ETHEREUM]: 'https://api.thegraph.com/subgraphs/name/blocklytics/ethereum-blocks',
    [ChainId.KLAYTN]: 'https://graph.dgswap.io/subgraphs/name/dragonswap/block',
    [ChainId.KLAYTN_TESTNET]: '',
  }
}
