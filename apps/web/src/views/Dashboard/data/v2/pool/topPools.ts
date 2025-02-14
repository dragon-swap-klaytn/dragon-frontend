import request, { gql } from 'graphql-request'
import { subgraphUrls } from 'lib/graph-queries/const'
import { useEffect, useState } from 'react'
import { getDeltaTimestamps } from 'utils/getDeltaTimestamps'

interface TopPoolsResponse {
  pairDayDatas: {
    id: string
  }[]
}

const getQuery = (firstCount: number, whereCondition: string) => gql`
      query topPools($blacklist: [String!]) {
        pairDayDatas(
          first: ${firstCount}
          ${whereCondition}
          orderBy: dailyVolumeUSD
          orderDirection: desc
        ) {
          id
        }
      }
    `

/**
 * Initial pools to display on the home page
 */
const fetchTopPools = async (timestamp24hAgo: number): Promise<string[]> => {
  const firstCount = 30
  const whereCondition = `where: { date_gt: ${timestamp24hAgo}, token0_not_in: $blacklist, token1_not_in: $blacklist }`
  try {
    let data = await request<TopPoolsResponse>(subgraphUrls.v2Exchange, getQuery(firstCount, whereCondition), {
      blacklist: [],
    })
    if (data.pairDayDatas.length === 0)
      data = await request<TopPoolsResponse>(subgraphUrls.v2Exchange, getQuery(firstCount, ''), {
        blacklist: [],
      })

    // pairDayDatas id has compound id "0xPOOLADDRESS-NUMBERS", extracting pool address with .split('-')
    return data.pairDayDatas.map((p) => p.id.split('-')[0])
  } catch (error) {
    console.error('Failed to fetch top pools', error)
    return []
  }
}

/**
 * Fetch top addresses by volume
 */
const useTopPoolAddresses = (): string[] => {
  const [topPoolAddresses, setTopPoolAddresses] = useState<string[]>([])
  const [timestamp24hAgo] = getDeltaTimestamps()

  useEffect(() => {
    const fetch = async () => {
      const addresses = await fetchTopPools(timestamp24hAgo)
      setTopPoolAddresses(addresses)
    }
    if (topPoolAddresses.length === 0) {
      fetch()
    }
  }, [topPoolAddresses, timestamp24hAgo])

  return topPoolAddresses
}

export const fetchTopPoolAddresses = async () => {
  const [timestamp24hAgo] = getDeltaTimestamps()

  const addresses = await fetchTopPools(timestamp24hAgo)
  return addresses
}

export default useTopPoolAddresses
