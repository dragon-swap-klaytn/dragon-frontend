/* eslint-disable no-await-in-loop */
import { ChainId, SUBGRAPH_START_BLOCK } from '@pancakeswap/chains'
import request, { gql } from 'graphql-request'

import { subgraphUrls } from 'lib/graph-queries/const'
import { useEffect, useState } from 'react'
import { fetchChartData, mapDayData } from 'views/Dashboard/helpers'
import { V2TokenChartEntry } from 'views/Dashboard/types'

/**
 * Data for displaying Liquidity and Volume charts on Overview page
 */
const PANCAKE_DAY_DATAS = gql`
  query overviewCharts($startTime: Timestamp!, $skip: Int!) {
    protocolStats_collection(
      first: 1000
      skip: $skip
      interval: "day"
      where: { timestamp_gt: $startTime }
      orderBy: timestamp
      orderDirection: asc
    ) {
      timestamp
      dailyVolumeUSD
      totalLiquidityUSD
    }
  }
`

const getOverviewChartData = async (skip: number) => {
  try {
    const { protocolStats_collection: protocolStats } = await request<{
      protocolStats_collection: { timestamp: string | number; dailyVolumeUSD: string; totalLiquidityUSD: string }[]
    }>(subgraphUrls.v2Exchange, PANCAKE_DAY_DATAS, {
      // Timestamp scalar is microseconds since epoch, passed as a string (the server rejects numeric literals)
      startTime: String(SUBGRAPH_START_BLOCK[ChainId.KLAYTN] * 1_000_000),
      skip,
    })

    // Convert microseconds back to seconds so downstream helpers work unchanged
    const data = protocolStats
      .map((row) => ({
        date: Math.floor(Number(row.timestamp) / 1_000_000),
        dailyVolumeUSD: row.dailyVolumeUSD,
        totalLiquidityUSD: row.totalLiquidityUSD,
      }))
      .map(mapDayData)
    return { data, error: false }
  } catch (error) {
    console.error('Failed to fetch overview chart data', error)
    return { error: true }
  }
}

/**
 * Fetch historic chart data
 */
const useFetchGlobalChartData = (): {
  error: boolean
  data: V2TokenChartEntry[] | undefined
} => {
  const [overviewChartData, setOverviewChartData] = useState<V2TokenChartEntry[] | undefined>()
  const [error, setError] = useState(false)

  useEffect(() => {
    const fetch = async () => {
      const { data } = await fetchChartData(getOverviewChartData)
      if (data) {
        setOverviewChartData(data)
      } else {
        setError(true)
      }
    }
    if (!overviewChartData && !error) {
      fetch()
    }
  }, [overviewChartData, error])

  return {
    error,
    data: overviewChartData,
  }
}

export const fetchV2GlobalChartData = async () => {
  try {
    const { data } = await fetchChartData(getOverviewChartData)

    return {
      error: false,
      data,
    }
  } catch (e) {
    console.error(e)
    return {
      error: true,
      data: undefined,
    }
  }
}

export default useFetchGlobalChartData
