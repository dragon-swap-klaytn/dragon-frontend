export const GRAPH_NODE = 'https://gateway.graph.dgswap.io'

export const subgraphUrls = {
  v3Exchange: `${GRAPH_NODE}/dgswap-exchange-v3-kaia`,
  v2Exchange: `${GRAPH_NODE}/dgswap-exchange-v2-kaia`,
}

export const BATCH_SIZE = 1_000 // Defines the number of pairs fetched per request to avoid exceeding API limits.

export const MIN_POOL_TVL_USD = 10
export const MIN_TOKEN_TVL_USD = 10
