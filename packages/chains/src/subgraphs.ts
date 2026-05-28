import { ChainId } from './chainId'

const DGSWAP_GATEWAY = process.env.NEXT_PUBLIC_DGSWAP_GATEWAY || 'https://gateway.graph.dgswap.io'

export const V3_SUBGRAPHS = getV3Subgraphs()
export const V2_SUBGRAPHS = getV2Subgraphs()

export const STABLESWAP_SUBGRAPHS = {
  [ChainId.KLAYTN]: '',
  [ChainId.KLAYTN_TESTNET]: '',
}

// NOTE [체인설정]_10 : subgraph url 설정
export function getV3Subgraphs() {
  return {
    [ChainId.KLAYTN]: `${DGSWAP_GATEWAY}/dgswap-exchange-v3-v131-kaia`,
    [ChainId.KLAYTN_TESTNET]: '',
  } satisfies Record<ChainId, string | null>
}

export function getV2Subgraphs() {
  return {
    [ChainId.KLAYTN]: `${DGSWAP_GATEWAY}/dgswap-exchange-v2-v120-kaia`,
    [ChainId.KLAYTN_TESTNET]: '',
  }
}

export const SUBGRAPH_START_BLOCK = {
  [ChainId.KLAYTN]: 145315220,
  [ChainId.KLAYTN_TESTNET]: 144998615,
}
