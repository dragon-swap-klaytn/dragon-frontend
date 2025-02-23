import request, { gql } from 'graphql-request'
import { subgraphUrls } from 'lib/graph-queries/const'
import { mapBurns, mapMints, mapSwaps } from 'views/Dashboard/helpers'
import { BurnResponse, MintResponse, SwapResponse } from 'views/Dashboard/types'
/**
 * Transactions of the given pool, used on Pool page
 */
const POOL_TRANSACTIONS = gql`
  query poolTransactions($address: ID!) {
    mints(first: 35, orderBy: timestamp, orderDirection: desc, where: { pair: $address }) {
      id
      timestamp
      to
      amount0
      amount1
      amountUSD
      pair {
        token0 {
          id
          symbol
        }
        token1 {
          id
          symbol
        }
      }
    }
    swaps(first: 35, orderBy: timestamp, orderDirection: desc, where: { pair: $address }) {
      id
      timestamp
      from
      amount0In
      amount1In
      amount0Out
      amount1Out
      amountUSD
      pair {
        token0 {
          id
          symbol
        }
        token1 {
          id
          symbol
        }
      }
    }
    burns(first: 35, orderBy: timestamp, orderDirection: desc, where: { pair: $address }) {
      id
      timestamp
      sender
      amount0
      amount1
      amountUSD
      pair {
        token0 {
          id
          symbol
        }
        token1 {
          id
          symbol
        }
      }
    }
  }
`

interface TransactionResults {
  mints: MintResponse[]
  swaps: SwapResponse[]
  burns: BurnResponse[]
}

export default async function fetchV2PoolTransactions(address: string) {
  try {
    const data = await request<TransactionResults>(subgraphUrls.v2Exchange, POOL_TRANSACTIONS, {
      address,
    })

    const mints = data.mints.map(mapMints)
    const burns = data.burns.map(mapBurns)
    const swaps = data.swaps.map(mapSwaps)
    return { data: [...mints, ...burns, ...swaps], error: false }
  } catch (error) {
    console.error(`Failed to fetch transactions for pool ${address}`, error)
    return {
      error: true,
    }
  }
}
