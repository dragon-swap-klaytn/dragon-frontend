import request, { gql } from 'graphql-request'
import { subgraphUrls } from 'lib/graph-queries/const'
import { TransactionEvent } from 'lib/graph-queries/types'
import { overrideToken } from 'lib/graph-queries/utils'

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
          origin
          amount0
          amount1
          amountUSD
        }
      }
    }
  `

  const { transactions } = await request(
    subgraphUrls.v3Exchange,
    document,
    { first: length },
    {
      'X-DS-User-Agent': 'dgswap-frontend',
    },
  )

  const mints = transactions.flatMap((t) =>
    t.mints.map((m) => ({
      timestamp: m.timestamp * 1000,
      pool: m.pool.id,
      txHash: m.transaction.id,
      token0: overrideToken(m.token0),
      token1: overrideToken(m.token1),
      account: m.origin,
      amount0: +m.amount0,
      amount1: +m.amount1,
      amountUSD: +m.amountUSD,
    })),
  ) as TransactionEvent[]

  const burns = transactions.flatMap((t) =>
    t.burns.map((b) => ({
      timestamp: b.timestamp * 1000,
      pool: b.pool.id,
      txHash: b.transaction.id,
      token0: overrideToken(b.token0),
      token1: overrideToken(b.token1),
      account: b.origin,
      amount0: +b.amount0,
      amount1: +b.amount1,
      amountUSD: +b.amountUSD,
    })),
  ) as TransactionEvent[]

  const swaps = transactions.flatMap((t) =>
    t.swaps.map((s) => ({
      timestamp: s.timestamp * 1000,
      pool: s.pool.id,
      txHash: s.transaction.id,
      token0: overrideToken(s.token0),
      token1: overrideToken(s.token1),
      account: s.origin,
      amount0: +s.amount0,
      amount1: +s.amount1,
      amountUSD: +s.amountUSD,
    })),
  ) as TransactionEvent[]

  return { mints, burns, swaps }
}
