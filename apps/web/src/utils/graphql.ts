import { ChainId, STABLESWAP_SUBGRAPHS } from '@pancakeswap/chains'
import {
  BIT_QUERY,
  INFO_CLIENT,
  INFO_CLIENT_ETH,
  V3_BSC_INFO_CLIENT,
  V3_SUBGRAPH_URLS,
} from 'config/constants/endpoints'
import { GraphQLClient } from 'graphql-request'
import { INFO_CLIENT_WITH_CHAIN } from '../config/constants/endpoints'

// Extra headers
// Mostly for dev environment
// No production env check since production preview might also need them
export const getGQLHeaders = (endpoint: string) => {
  if (endpoint === INFO_CLIENT && process.env.NEXT_PUBLIC_NODE_REAL_HEADER) {
    return {
      origin: process.env.NEXT_PUBLIC_NODE_REAL_HEADER,
    }
  }
  return undefined
}

export const infoClient = new GraphQLClient(INFO_CLIENT)

export const infoClientWithChain = (chainId?: number) => {
  if (chainId && INFO_CLIENT_WITH_CHAIN[chainId]) {
    return new GraphQLClient(INFO_CLIENT_WITH_CHAIN[chainId], {
      headers: getGQLHeaders(INFO_CLIENT_WITH_CHAIN[chainId]),
    })
  }
  return undefined
}

// DEV_NOTE [체인설정]_10-1 : graphql client 설정
export const v3Clients = {
  [ChainId.ETHEREUM]: new GraphQLClient(V3_SUBGRAPH_URLS[ChainId.ETHEREUM]),
  [ChainId.GOERLI]: new GraphQLClient(V3_SUBGRAPH_URLS[ChainId.GOERLI]),
  [ChainId.BSC]: new GraphQLClient(V3_SUBGRAPH_URLS[ChainId.BSC]),
  [ChainId.BSC_TESTNET]: new GraphQLClient(V3_SUBGRAPH_URLS[ChainId.BSC_TESTNET]),
  [ChainId.KLAYTN]: new GraphQLClient(V3_SUBGRAPH_URLS[ChainId.KLAYTN]),
  [ChainId.KLAYTN_TESTNET]: new GraphQLClient(V3_SUBGRAPH_URLS[ChainId.KLAYTN_TESTNET]),
}

export const v3InfoClients = { ...v3Clients, [ChainId.BSC]: new GraphQLClient(V3_BSC_INFO_CLIENT) }

export const infoClientETH = new GraphQLClient(INFO_CLIENT_ETH)

export const v2Clients = {
  [ChainId.ETHEREUM]: infoClientETH,
  [ChainId.BSC]: infoClient,
  ...(INFO_CLIENT_WITH_CHAIN[ChainId.KLAYTN]
    ? { [ChainId.KLAYTN]: new GraphQLClient(INFO_CLIENT_WITH_CHAIN[ChainId.KLAYTN]) }
    : {}),
  [ChainId.KLAYTN_TESTNET]: new GraphQLClient(INFO_CLIENT_WITH_CHAIN[ChainId.KLAYTN_TESTNET]),
}

export const infoStableSwapClients = {
  [ChainId.BSC]: new GraphQLClient(STABLESWAP_SUBGRAPHS[ChainId.BSC]),
}

export const infoServerClient = new GraphQLClient(INFO_CLIENT, {
  timeout: 5000,
  headers: {
    origin: 'https://dgswap.io',
  },
})

export const stableSwapClient = new GraphQLClient(STABLESWAP_SUBGRAPHS[ChainId.BSC])

export const bitQueryServerClient = new GraphQLClient(BIT_QUERY, {
  headers: {
    // only server, no `NEXT_PUBLIC` not going to expose in client
    'X-API-KEY': process.env.BIT_QUERY_HEADER || '',
  },
  timeout: 5000,
})
