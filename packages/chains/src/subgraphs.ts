import { ChainId } from './chainId'

const DGSWAP_GATEWAY = process.env.NEXT_PUBLIC_DGSWAP_GATEWAY || 'https://gateway.graph.dgswap.io'

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
    [ChainId.KLAYTN]: `${DGSWAP_GATEWAY}/dgswap-exchange-v3-kaia`,
    [ChainId.KLAYTN_TESTNET]: '',
  } satisfies Record<ChainId, string | null>
}

export function getV2Subgraphs() {
  return {
    [ChainId.BSC]: 'https://proxy-worker-api.pancakeswap.com/bsc-exchange',
    [ChainId.ETHEREUM]: 'https://api.thegraph.com/subgraphs/name/pancakeswap/exhange-eth',
    [ChainId.KLAYTN]: `${DGSWAP_GATEWAY}/dgswap-exchange-v2-kaia`,
    [ChainId.KLAYTN_TESTNET]: '',
  }
}

export function getBlocksSubgraphs() {
  return {
    [ChainId.BSC]: 'https://api.thegraph.com/subgraphs/name/pancakeswap/blocks',
    [ChainId.ETHEREUM]: 'https://api.thegraph.com/subgraphs/name/blocklytics/ethereum-blocks',
    [ChainId.KLAYTN]: `${DGSWAP_GATEWAY}/dgswap-blocks-kaia`,
    [ChainId.KLAYTN_TESTNET]: '',
  }
}
