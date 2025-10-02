import { blockTimestampCache } from 'lru-caches'
import { viemClients } from 'utils/viem'

const publicClient = viemClients[8217]

// Dedupes concurrent requests for the same blockNumber
const inFlightBlockTs = new Map<string, Promise<number>>()

export const getBlockTimestampMSFromPublicNode = async (blockNumber: bigint) => {
  const { timestamp } = await publicClient.getBlock({ blockNumber })
  return Number(timestamp) * 1000
}

export const getBlockTimestampMSFromSwapscanner = async (blockNumber: bigint) => {
  const { timestamp } = await fetch(
    `https://api.swapscanner.io/api/v0/dg-swap/blockTimestamp?blockNumber=${blockNumber.toString()}`,
  ).then((res) => res.json())

  return Number(timestamp)
}

export const getBlockTimestampMS = async (blockNumber: bigint) => {
  const key = blockNumber.toString()

  // 1) Return from LRU cache if present
  const cached = blockTimestampCache.get(key)
  if (typeof cached === 'number') {
    return cached
  }

  // 2) If a request for this key is already in-flight, await it
  const existing = inFlightBlockTs.get(key)
  if (existing) {
    return existing
  }

  // 3) Otherwise, start a new request and store the *promise* in the in-flight map
  const fetchPromise: Promise<number> = (async () => {
    try {
      // use only swapscanner for now
      const timestamp = await getBlockTimestampMSFromSwapscanner(blockNumber)
      // const timestamp = await Promise.any([
      //   getBlockTimestampMSFromPublicNode(blockNumber),
      //   getBlockTimestampMSFromSwapscanner(blockNumber),
      // ]);

      // Cache the resolved value (number) in LRU and return it
      blockTimestampCache.put(key, timestamp)
      return timestamp
    } finally {
      // Always clear the in-flight entry (on success or failure)
      inFlightBlockTs.delete(key)
    }
  })()

  inFlightBlockTs.set(key, fetchPromise)
  return fetchPromise
}
