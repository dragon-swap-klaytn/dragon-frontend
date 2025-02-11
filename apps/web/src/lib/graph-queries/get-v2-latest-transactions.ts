import request, { gql } from 'graphql-request'
import { subgraphUrls } from 'lib/graph-queries/const'
import { TransactionEvent } from 'lib/graph-queries/types'

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
          }
          token1 {
            id
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
          }
          token1 {
            id
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
          }
          token1 {
            id
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

  const { transactions } = await request(subgraphUrls.v2Exchange, document, { first: length })

  const mints = transactions.flatMap((t) =>
    t.mints.map(
      (m) =>
        ({
          timestamp: m.timestamp * 1000,
          pool: m.pair.id,
          txHash: m.transaction.id,
          token0: m.token0.id,
          token1: m.token1.id,
          account: m.sender,
          amount0: +m.amount0,
          amount1: +m.amount1,
          amountUSD: +m.amountUSD,
        } as TransactionEvent),
    ),
  )

  const burns = transactions.flatMap((t) =>
    t.burns.map(
      (b) =>
        ({
          timestamp: b.timestamp * 1000,
          pool: b.pair.id,
          txHash: b.transaction.id,
          token0: b.token0.id,
          token1: b.token1.id,
          account: b.sender,
          amount0: +b.amount0,
          amount1: +b.amount1,
          amountUSD: +b.amountUSD,
        } as TransactionEvent),
    ),
  )

  const swaps = transactions.flatMap((t) =>
    t.swaps.map(
      (s) =>
        ({
          timestamp: s.timestamp * 1000,
          pool: s.pair.id,
          txHash: s.transaction.id,
          token0: s.token0.id,
          token1: s.token1.id,
          account: s.from,
          amount0: +s.amount0In - +s.amount0Out,
          amount1: +s.amount1In - +s.amount1Out,
          amountUSD: +s.amountUSD,
        } as TransactionEvent),
    ),
  )

  return { mints, burns, swaps }
}
