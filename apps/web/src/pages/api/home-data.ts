import { getCachedBlockNumbers } from 'lib/get-cached-block-numbers'
import { getV2FactoryData } from 'lib/graph-queries/get-v2-factory-data'
import { getV3FactoryData } from 'lib/graph-queries/get-v3-factory-data'
import { NextApiHandler } from 'next'

const getSwapscannerDashboardData = async () => {
  const res = await fetch('https://api.swapscanner.io/api/v2/stats/dashboard')

  if (!res.ok) throw new Error('Failed to fetch dashboard data from swapscanner')

  return res.json()
}

const getSwapscannerForexData = async () => {
  const res = await fetch('https://api.swapscanner.io/api/forex')

  if (!res.ok) throw new Error('Failed to fetch forex data from swapscanner')

  return res.json()
}

const getSwapscannerSummaryData = async () => {
  const [ssDashboardData, forexData] = await Promise.all([getSwapscannerDashboardData(), getSwapscannerForexData()])

  const usdCoingecko = forexData.USD_COINGECKO
  const lastIndex = ssDashboardData.tvl.value.length - 1
  const latestTimestamp = new Date(ssDashboardData.tvl.value[lastIndex][0]).getTime()
  const tvlUSD = ssDashboardData.tvl.value[lastIndex][1] * usdCoingecko
  const volumeUSD = ssDashboardData.swapVolumeUSDC.value[lastIndex][1] * usdCoingecko
  const swapCount = ssDashboardData.swaps.value[lastIndex][1]

  return {
    timestamp: latestTimestamp,
    tvlUSD,
    volumeUSD,
    swapCount,
  }
}

const DAY = 24 * 60 * 60 * 1000

// this API endpoint is for internal use (serving data for homepage)
const handler: NextApiHandler = async (req, res) => {
  if (process.env.NODE_ENV !== 'development') {
    res.status(404).end()
    return
  }

  const { timestamp, tvlUSD, volumeUSD, swapCount } = await getSwapscannerSummaryData()
  const blocks = await getCachedBlockNumbers([timestamp, timestamp + DAY])

  const [v2Yesterday, v2Today, v3Yesterday, v3Today] = await Promise.all([
    getV2FactoryData({ blockNumber: blocks[0] }),
    getV2FactoryData({ blockNumber: blocks[1] }),
    getV3FactoryData({ blockNumber: blocks[0] }),
    getV3FactoryData({ blockNumber: blocks[1] }),
  ])

  const data = {
    timestamp,
    dragonSwap: {
      tvlUSD: v2Today.tvlUSD + v3Today.tvlUSD,
      volumeUSD: v2Today.volumeUSD + v3Today.volumeUSD - v2Yesterday.volumeUSD - v3Yesterday.volumeUSD,
      txCount: v2Today.txCount + v3Today.txCount - v2Yesterday.txCount - v3Yesterday.txCount,
      poolCount: v2Today.poolCount + v3Today.poolCount,
    },
    kaia: {
      tvlUSD,
      volumeUSD,
      swapCount,
    },
  }

  res.json(data)
}

export default handler
