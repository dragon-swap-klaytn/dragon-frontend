import request, { gql } from 'graphql-request'
import { subgraphUrls } from 'lib/graph-queries/const'
import { TransactionEvent } from 'lib/graph-queries/types'

export const getV3LatestTransactions = async ({ length = 100 } = {}) => {
  const document = gql`
    query ($first: Int) {
      transactions(first: $first, orderBy: timestamp, orderDirection: desc) {
        mints(first: 100, orderBy: timestamp, orderDirection: desc) {
          timestamp
          pool {
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
          origin
          amount0
          amount1
          amountUSD
        }
        burns(first: 100, orderBy: timestamp, orderDirection: desc) {
          timestamp
          pool {
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
          origin
          amount0
          amount1
          amountUSD
        }
        swaps(first: 100, orderBy: timestamp, orderDirection: desc) {
          timestamp
          pool {
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
          origin
          amount0
          amount1
          amountUSD
        }
      }
    }
  `

  const { transactions } = await request(subgraphUrls.v3Exchange, document, { first: length })

  const mints = transactions.flatMap((t) =>
    t.mints.map(
      (m) =>
        ({
          timestamp: m.timestamp * 1000,
          pool: m.pool.id,
          txHash: m.transaction.id,
          token0: m.token0.id,
          token1: m.token1.id,
          account: m.origin,
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
          pool: b.pool.id,
          txHash: b.transaction.id,
          token0: b.token0.id,
          token1: b.token1.id,
          account: b.origin,
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
          pool: s.pool.id,
          txHash: s.transaction.id,
          token0: s.token0.id,
          token1: s.token1.id,
          account: s.origin,
          amount0: +s.amount0,
          amount1: +s.amount1,
          amountUSD: +s.amountUSD,
        } as TransactionEvent),
    ),
  )

  return { mints, burns, swaps }
}
