import request, { gql } from 'graphql-request'
import { subgraphUrls } from 'lib/graph-queries/const'
import { TransactionEvent } from 'lib/graph-queries/types'
import { overrideToken } from 'lib/graph-queries/utils'

export const getV2LatestTransactions = async ({ length = 100 } = {}) => {
  const document = gql`
    query ($first: Int) {
      transactions(first: $first, orderBy: timestamp, orderDirection: desc) {
        mints(first: 100, orderBy: timestamp, orderDirection: desc) {
          timestamp
          pair {
            id
          }
          transaction {
            id
          }
          token0 {
            id
            symbol
            name
            decimals
          }
          token1 {
            id
            symbol
            name
            decimals
          }
          sender
          amount0
          amount1
          amountUSD
        }
        burns(first: 100, orderBy: timestamp, orderDirection: desc) {
          timestamp
          pair {
            id
          }
          transaction {
            id
          }
          token0 {
            id
            symbol
            name
            decimals
          }
          token1 {
            id
            symbol
            name
            decimals
          }
          sender
          amount0
          amount1
          amountUSD
        }
        swaps(first: 100, orderBy: timestamp, orderDirection: desc) {
          timestamp
          pair {
            id
          }
          transaction {
            id
          }
          token0 {
            id
            symbol
            name
            decimals
          }
          token1 {
            id
            symbol
            name
            decimals
          }
          from
          amount0In
          amount0Out
          amount1In
          amount1Out
          amountUSD
        }
      }
    }
  `

  const { transactions } = await request(
    subgraphUrls.v2Exchange,
    document,
    { first: length },
    {
      'X-DS-User-Agent': 'dgswap-frontend',
    },
  )

  const mints = transactions.flatMap((t) =>
    t.mints.map((m) => ({
      timestamp: m.timestamp * 1000,
      pool: m.pair.id,
      txHash: m.transaction.id,
      token0: overrideToken(m.token0),
      token1: overrideToken(m.token1),
      account: m.sender,
      amount0: +m.amount0,
      amount1: +m.amount1,
      amountUSD: +m.amountUSD,
    })),
  ) as TransactionEvent[]

  const burns = transactions.flatMap((t) =>
    t.burns.map((b) => ({
      timestamp: b.timestamp * 1000,
      pool: b.pair.id,
      txHash: b.transaction.id,
      token0: overrideToken(b.token0),
      token1: overrideToken(b.token1),
      account: b.sender,
      amount0: +b.amount0,
      amount1: +b.amount1,
      amountUSD: +b.amountUSD,
    })),
  ) as TransactionEvent[]

  const swaps = transactions.flatMap((t) =>
    t.swaps.map((s) => ({
      timestamp: s.timestamp * 1000,
      pool: s.pair.id,
      txHash: s.transaction.id,
      token0: overrideToken(s.token0),
      token1: overrideToken(s.token1),
      account: s.from,
      amount0: +s.amount0In - +s.amount0Out,
      amount1: +s.amount1In - +s.amount1Out,
      amountUSD: +s.amountUSD,
    })),
  ) as TransactionEvent[]

  return { mints, burns, swaps }
}
