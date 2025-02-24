import { getCachedBlockNumbers } from 'lib/get-cached-block-numbers'
import { getV2FactoryData } from 'lib/graph-queries/get-v2-factory-data'
import { getV3FactoryData } from 'lib/graph-queries/get-v3-factory-data'
import { NextApiHandler } from 'next'

const getSwapscannerDashboardData = async () => {
  const res = await fetch('https://api.swapscanner.io/api/v2/stats/dashboard')

  if (!res.ok) throw new Error('Failed to fetch dashboard data from swapscanner')

  return res.json()
}

const getSwapscannerSummaryData = async () => {
  const ssDashboardData = await getSwapscannerDashboardData()

  const data: { timestamp: number; tvlUSD: number; volumeUSD: number; swapCount: number }[] = []

  ssDashboardData.tvl.value.forEach(([timestamp], index) => {
    const tvlUSD = ssDashboardData.tvl.value[index][1] * 1
    const volumeUSD = ssDashboardData.swapVolumeUSDC.value[index][1] * 1
    const swapCount = ssDashboardData.swaps.value[index][1]

    data.push({ timestamp, tvlUSD, volumeUSD, swapCount })
  })

  return data
}

const DAY = 24 * 60 * 60 * 1000

// this API endpoint is for internal use (serving data for homepage)
const handler: NextApiHandler = async (req, res) => {
  if (process.env.NODE_ENV !== 'development') {
    res.status(404).end()
    return
  }

  const data: any[] = []

  const ssData = await getSwapscannerSummaryData()

  for (let i = 0; i < ssData.length; i++) {
    const { timestamp, tvlUSD, volumeUSD, swapCount } = ssData[i]

    // eslint-disable-next-line no-await-in-loop
    const blocks = await getCachedBlockNumbers([timestamp, timestamp + DAY])

    // eslint-disable-next-line no-await-in-loop
    const [v2Yesterday, v2Today, v3Yesterday, v3Today] = await Promise.all([
      getV2FactoryData({ blockNumber: blocks[0] }),
      getV2FactoryData({ blockNumber: blocks[1] }),
      getV3FactoryData({ blockNumber: blocks[0] }),
      getV3FactoryData({ blockNumber: blocks[1] }),
    ])

    data.push({
      timestamp,
      date: new Date(timestamp).toISOString(),
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
    })

    console.log('awaiting 1s...', i + 1)
    // eslint-disable-next-line no-await-in-loop
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }

  res.json(data)
}

export default handler
