/* eslint-disable address/addr-type */

import { Address } from 'viem'

export const GRAPH_NODE = 'https://gateway.graph.dgswap.io'

export const subgraphUrls = {
  v3Exchange: `${GRAPH_NODE}/dgswap-exchange-v3-kaia`,
  v2Exchange: `${GRAPH_NODE}/dgswap-exchange-v2-kaia`,
}

export const BATCH_SIZE = 1_000 // Defines the number of pairs fetched per request to avoid exceeding API limits.

export const MIN_POOL_TVL_USD = 10
export const MIN_TOKEN_TVL_USD = 10

export const WKLAY_ADDRESS = '0x19aac5f612f524b754ca7e7c41cbfa2e981a4432' as Address
export const WGCKLAY_ADDRESS = '0xa9999999c3d05fb75ce7230e0d22f5625527d583' as Address
const USDT_ADDRESSES = {
  portal: '0x5c13e303a62fc5dedf5b52d66873f2e59fedadc2' as Address,
  synapse: '0xd6dab4cff47df175349e6e7ee2bf7c40bb8c05a3' as Address,
}
const USDC_ADDRESSES = {
  portal: '0x608792deb376cce1c9fa4d0e6b7b44f507cffa6a' as Address,
  synapse: '0x6270b58be569a7c0b8f47594f191631ae5b2c86c' as Address,
}
const DAI_ADDRESSES = {
  portal: '0xcb2c7998696ef7a582dfd0aafadcd008d03e791a' as Address,
  synapse: '0x078db7827a5531359f6cb63f62cfa20183c4f10c' as Address,
}
const WETH_ADDRESSES = {
  portal: '0x98a8345bb9d3dda9d808ca1c9142a28f6b0430e1' as Address,
  synapse: '0xcd6f29dc9ca217d0973d3d21bf58edd3ca871a86' as Address,
}
const WBTC_ADDRESSES = {
  portal: '0x15d9f3ab1982b0e5a415451259994ff40369f584' as Address,
  synapse: '0xdcbacf3f7a069922e677912998c8d57423c37dfa' as Address,
}

const KRWO_ADDRESS = '0x7fc692699f2216647a0e06225d8bdf8cdee40e7f' as Address

// eslint-disable-next-line address/addr-type
export const FORCE_WHITELISTED_V3_POOLS: string[] = []

export const tokensToBeOverridden: Record<
  Address,
  Partial<{
    symbol: (v: string) => string
    name: (v: string) => string
  }>
> = {
  [WKLAY_ADDRESS]: {
    symbol: () => 'WKAIA',
    name: () => 'Wrapped Kaia',
  },
  [WGCKLAY_ADDRESS]: {
    symbol: () => 'wGCKAIA',
    name: () => 'Wrapped Governance Council Kaia',
  },
  [USDT_ADDRESSES.portal]: {
    name: (v) => `${v} (Portal Bridge)`,
  },
  [USDT_ADDRESSES.synapse]: {
    name: (v) => `${v} (Synapse Bridge)`,
  },
  [USDC_ADDRESSES.portal]: {
    name: (v) => `${v} (Portal Bridge)`,
  },
  [USDC_ADDRESSES.synapse]: {
    name: (v) => `${v} (Synapse Bridge)`,
  },
  [DAI_ADDRESSES.portal]: {
    name: (v) => `${v} (Portal Bridge)`,
  },
  [DAI_ADDRESSES.synapse]: {
    name: (v) => `${v} (Synapse Bridge)`,
  },
  [WETH_ADDRESSES.portal]: {
    name: (v) => `${v} (Portal Bridge)`,
  },
  [WETH_ADDRESSES.synapse]: {
    name: (v) => `${v} (Synapse Bridge)`,
  },
  [WBTC_ADDRESSES.portal]: {
    name: (v) => `${v} (Portal Bridge)`,
  },
  [WBTC_ADDRESSES.synapse]: {
    name: (v) => `${v} (Synapse Bridge)`,
  },
  [KRWO_ADDRESS]: {
    name: () => 'KRWO',
  },
}
