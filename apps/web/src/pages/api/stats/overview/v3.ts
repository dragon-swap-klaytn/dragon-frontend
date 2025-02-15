import { getV3LatestTransactions } from 'lib/graph-queries/get-v3-latest-transactions'
import { getV3PancakeDayData } from 'lib/graph-queries/get-v3-pancake-day-data'
import { NextApiHandler } from 'next'
import { localCachedV2 } from 'utils/localCachedV2'

const getCachedV3PancakeDayData = localCachedV2(() => getV3PancakeDayData({ length: 60 }), {
  staleWhileRevalidate: true,
  ttl: 1000 * 60 * 10,
  ttlOnCatch: 5 * 1000,
}).cachedFetcher

const getCachedV3TransactionEvents = localCachedV2(() => getV3LatestTransactions({ length: 100 }), {
  staleWhileRevalidate: true,
  ttl: 1000 * 60 * 10,
  ttlOnCatch: 5 * 1000,
}).cachedFetcher

const handler: NextApiHandler = async (req, res) => {
  const [chartData, transactions] = await Promise.all([getCachedV3PancakeDayData(), getCachedV3TransactionEvents()])

  res.json({ chartData, transactions })
}

export default handler
