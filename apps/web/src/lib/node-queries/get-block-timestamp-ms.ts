import { blockTimestampCache } from 'lru-caches'
import { viemClients } from 'utils/viem'

const publicClient = viemClients[8217]

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

  // check lru-cache
  const ts = blockTimestampCache.get(key)

  if (ts) {
    return ts
  }

  try {
    const timestamp = await Promise.any([
      getBlockTimestampMSFromPublicNode(blockNumber),
      getBlockTimestampMSFromSwapscanner(blockNumber),
    ])

    // cache the result
    blockTimestampCache.put(key, timestamp)

    return timestamp
  } catch (error) {
    console.error('All promises failed to resolve', error)
    throw new Error('Could not fetch block timestamp from any source.')
  }
}
