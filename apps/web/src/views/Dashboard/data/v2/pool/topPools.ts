import request, { gql } from 'graphql-request'
import { subgraphUrls } from 'lib/graph-queries/const'
import { useEffect, useState } from 'react'
import { getDeltaTimestamps } from 'utils/getDeltaTimestamps'

interface TopPoolsResponse {
  pairStats_collection: {
    pair: { id: string }
  }[]
}

const getQuery = (firstCount: number, whereCondition: string) => gql`
      query topPools {
        pairStats_collection(
          first: ${firstCount}
          interval: "day"
          ${whereCondition}
          orderBy: dailyVolumeUSD
          orderDirection: desc
        ) {
          pair {
            id
          }
        }
      }
    `

/**
 * Initial pools to display on the home page
 */
const fetchTopPools = async (sinceTimestamp: number): Promise<string[]> => {
  const firstCount = 30
  // pairStats are daily aggregation buckets, exposed only once the interval completes (there is no
  // in-progress "today" bucket), so a 24h window always misses the latest — yesterday's — bucket and
  // falls through to the all-time fallback. The caller passes the 48h mark so yesterday's completed
  // bucket is included. The Timestamp scalar is microseconds since epoch; quote it so the server parses
  // it as the Timestamp string scalar — a bare integer literal this large overflows the 32-bit Int parser.
  const startMicros = sinceTimestamp * 1_000_000
  const whereCondition = `where: { timestamp_gt: "${startMicros}" }`
  try {
    let data = await request<TopPoolsResponse>(subgraphUrls.v2Exchange, getQuery(firstCount, whereCondition))
    if (data.pairStats_collection.length === 0)
      data = await request<TopPoolsResponse>(subgraphUrls.v2Exchange, getQuery(firstCount, ''))

    // One pairStats row exists per (pair, day bucket); dedupe to distinct pool addresses, preserving volume order.
    return [...new Set(data.pairStats_collection.map((p) => p.pair.id))]
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
  const [, timestamp48hAgo] = getDeltaTimestamps()

  useEffect(() => {
    const fetch = async () => {
      const addresses = await fetchTopPools(timestamp48hAgo)
      setTopPoolAddresses(addresses)
    }
    if (topPoolAddresses.length === 0) {
      fetch()
    }
  }, [topPoolAddresses, timestamp48hAgo])

  return topPoolAddresses
}

export const fetchTopPoolAddresses = async () => {
  const [, timestamp48hAgo] = getDeltaTimestamps()

  const addresses = await fetchTopPools(timestamp48hAgo)
  return addresses
}

export default useTopPoolAddresses
