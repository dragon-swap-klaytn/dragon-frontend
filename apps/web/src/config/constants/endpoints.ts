// DEV_NOTE : 외부 API(static, governance, subgraph 등) URL

import { BLOCKS_SUBGRAPHS, ChainId, V2_SUBGRAPHS, V3_SUBGRAPHS } from '@pancakeswap/chains'

export const GRAPH_API_PROFILE = ''

export const GRAPH_API_LOTTERY = ''
export const SNAPSHOT_BASE_URL = process.env.NEXT_PUBLIC_SNAPSHOT_BASE_URL
export const API_PROFILE = ''
export const API_NFT = ''
export const SNAPSHOT_API = `${SNAPSHOT_BASE_URL}/graphql`
export const SNAPSHOT_HUB_API = `${SNAPSHOT_BASE_URL}/api/message`
export const GRAPH_API_POTTERY = ''
export const ONRAMP_API_BASE_URL = ''
export const MOONPAY_BASE_URL = 'https://api.moonpay.com'
export const NOTIFICATION_HUB_BASE_URL = ''
/**
 * V1 will be deprecated but is still used to claim old rounds
 */
export const GRAPH_API_PREDICTION_V1 = ''

export const INFO_CLIENT = 'https://proxy-worker-api.pancakeswap.com/bsc-exchange'
export const INFO_CLIENT_ETH = 'https://api.thegraph.com/subgraphs/name/pancakeswap/exhange-eth'
export const INFO_CLIENT_KLAY = ''

export const V3_BSC_INFO_CLIENT = `https://open-platform.nodereal.io/${
  process.env.NEXT_PUBLIC_NODE_REAL_API_INFO || process.env.NEXT_PUBLIC_NODE_REAL_API_ETH
}/pancakeswap-v3/graphql`

export const BLOCKS_CLIENT = BLOCKS_SUBGRAPHS[ChainId.BSC]
export const BLOCKS_CLIENT_ETH = BLOCKS_SUBGRAPHS[ChainId.ETHEREUM]
export const BLOCKS_CLIENT_KLAYTN = BLOCKS_SUBGRAPHS[ChainId.KLAYTN]
export const BLOCKS_CLIENT_KLAYTN_TESTNET = BLOCKS_SUBGRAPHS[ChainId.KLAYTN_TESTNET]

export const GRAPH_API_NFTMARKET = 'https://api.thegraph.com/subgraphs/name/pancakeswap/nft-market'
export const GRAPH_HEALTH = 'https://api.thegraph.com/index-node/graphql'

export const TC_MOBOX_SUBGRAPH = 'https://api.thegraph.com/subgraphs/name/pancakeswap/trading-competition-v3'
export const TC_MOD_SUBGRAPH = 'https://api.thegraph.com/subgraphs/name/pancakeswap/trading-competition-v4'

export const BIT_QUERY = 'https://graphql.bitquery.io'

export const ACCESS_RISK_API = ''

export const CELER_API = 'https://api.celerscan.com/scan'

export const INFO_CLIENT_WITH_CHAIN = V2_SUBGRAPHS

export const BLOCKS_CLIENT_WITH_CHAIN = BLOCKS_SUBGRAPHS

export const ASSET_CDN = ''

export const V3_SUBGRAPH_URLS = V3_SUBGRAPHS

export const TRADING_REWARD_API = ''

export const QUOTING_API = `${process.env.NEXT_PUBLIC_QUOTING_API}/v0/quote`

export const FARMS_API = ''

export const MERCURYO_WIDGET_ID = process.env.NEXT_PUBLIC_MERCURYO_WIDGET_ID

export const MOONPAY_API_KEY = process.env.NEXT_PUBLIC_MOONPAY_LIVE_KEY

export const TRANSAK_API_KEY = process.env.NEXT_PUBLIC_TRANSAK_LIVE_KEY
// no need for extra public env
export const MERCURYO_WIDGET_URL =
  process.env.NODE_ENV === 'development'
    ? 'https://sandbox-widget.mrcr.io/embed.2.0.js'
    : 'https://widget.mercuryo.io/embed.2.0.js'
