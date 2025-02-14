import { ChainId, STABLESWAP_SUBGRAPHS } from '@pancakeswap/chains'
import { DGSWAP_DOMAIN } from '@pancakeswap/uikit'
import { BIT_QUERY, INFO_CLIENT, INFO_CLIENT_ETH, V3_SUBGRAPH_URLS } from 'config/constants/endpoints'
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
  [ChainId.KLAYTN]: new GraphQLClient(V3_SUBGRAPH_URLS[ChainId.KLAYTN]),
  [ChainId.KLAYTN_TESTNET]: new GraphQLClient(V3_SUBGRAPH_URLS[ChainId.KLAYTN_TESTNET]),
}

export const v3InfoClients = { ...v3Clients }
export const infoClientETH = new GraphQLClient(INFO_CLIENT_ETH)

export const v2Clients = {
  [ChainId.KLAYTN]: new GraphQLClient(INFO_CLIENT_WITH_CHAIN[ChainId.KLAYTN]),
  [ChainId.KLAYTN_TESTNET]: new GraphQLClient(INFO_CLIENT_WITH_CHAIN[ChainId.KLAYTN_TESTNET]),
}
export const v2InfoClients = { ...v2Clients }
export function getGraphClient({
  chainId = ChainId.KLAYTN,
  poolType = 'v3',
}: {
  chainId?: ChainId
  poolType?: 'v2' | 'v3'
} = {}): GraphQLClient {
  if (poolType === 'v2') {
    return v2InfoClients[chainId]
  }

  return v3InfoClients[chainId]
}

export const infoStableSwapClients = {}

export const infoServerClient = new GraphQLClient(INFO_CLIENT, {
  timeout: 5000,
  headers: {
    origin: DGSWAP_DOMAIN,
  },
})

export const stableSwapClient = new GraphQLClient(STABLESWAP_SUBGRAPHS[ChainId.KLAYTN])

export const bitQueryServerClient = new GraphQLClient(BIT_QUERY, {
  headers: {
    // only server, no `NEXT_PUBLIC` not going to expose in client
    'X-API-KEY': process.env.BIT_QUERY_HEADER || '',
  },
  timeout: 5000,
})
