import { getV2LatestTransactions } from 'lib/graph-queries/get-v2-latest-transactions'
import { getV2PancakeDayData } from 'lib/graph-queries/get-v2-pancake-day-data'
import { NextApiHandler } from 'next'
import { localCachedV2 } from 'utils/localCachedV2'

const getCachedV2PancakeDayData = localCachedV2(() => getV2PancakeDayData({ length: 60 }), {
  staleWhileRevalidate: true,
  ttl: 1000 * 60 * 10,
  ttlOnCatch: 5 * 1000,
}).cachedFetcher

const getCachedV2TransactionEvents = localCachedV2(() => getV2LatestTransactions({ length: 100 }), {
  staleWhileRevalidate: true,
  ttl: 1000 * 60 * 10,
  ttlOnCatch: 5 * 1000,
}).cachedFetcher

const handler: NextApiHandler = async (req, res) => {
  const [chartData, transactions] = await Promise.all([getCachedV2PancakeDayData(), getCachedV2TransactionEvents()])

  res.json({ chartData, transactions })
}

export default handler
