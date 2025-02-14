/* eslint-disable no-await-in-loop */
import { ChainId, SUBGRAPH_START_BLOCK } from '@pancakeswap/chains'
import request, { gql } from 'graphql-request'

import { subgraphUrls } from 'lib/graph-queries/const'
import { useEffect, useState } from 'react'
import { fetchChartData, mapDayData } from 'views/Dashboard/helpers'
import { PancakeDayDatasResponse, V2TokenChartEntry } from 'views/Dashboard/types'

/**
 * Data for displaying Liquidity and Volume charts on Overview page
 */
const PANCAKE_DAY_DATAS = gql`
  query overviewCharts($startTime: Int!, $skip: Int!) {
    pancakeDayDatas(first: 1000, skip: $skip, where: { date_gt: $startTime }, orderBy: date, orderDirection: asc) {
      date
      dailyVolumeUSD
      totalLiquidityUSD
    }
  }
`

const getOverviewChartData = async (skip: number) => {
  try {
    const { pancakeDayDatas } = await request<PancakeDayDatasResponse>(subgraphUrls.v2Exchange, PANCAKE_DAY_DATAS, {
      startTime: SUBGRAPH_START_BLOCK[ChainId.KLAYTN],
      skip,
    })

    const data = pancakeDayDatas.map(mapDayData)
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
