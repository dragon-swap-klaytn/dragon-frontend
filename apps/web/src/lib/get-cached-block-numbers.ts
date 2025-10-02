import { getBlockNumberOfTimestamp } from 'lib/node-queries/get-block-number-of-timestamp'
import { blockNumberCache } from 'lru-caches'

// Each bucket covers 10 minutes (in seconds):
// const BUCKET_SIZE = 10 * 60 // 600 seconds = 10 minutes
// if using MongoDB, we set the bucket size to 5 minutes (in seconds):
const BUCKET_SIZE = process.env.USE_MONGO_CACHE === 'true' && !!process.env.MONGODB ? 5 * 60 : 10 * 60

/**
 * Convert a millisecond timestamp to a "bucketed" timestamp (in seconds).
 * For example, if BUCKET_SIZE = 600, we group each 600-second window.
 */
function bucketTimestamp(msTimestamp: number, { bucketSize = BUCKET_SIZE } = {}): number {
  // 1) Convert ms => seconds
  // 2) Divide by BUCKET_SIZE
  // 3) Floor
  // 4) Multiply back by BUCKET_SIZE to get the start of that bucket
  return Math.floor(msTimestamp / 1000 / bucketSize) * bucketSize
}

export async function getCachedBlockNumbers(timestamps: number[]): Promise<number[]> {
  // 1. Convert the original (ms) timestamps to their bucketed (sec) equivalents
  const bucketedTimestamps = timestamps.map((timestamp) => bucketTimestamp(timestamp))

  // 2. Check cache for each bucketed timestamp
  //    We'll build a local map: bucketKey => cachedBlockNumber|null
  const bucketedMap: Record<number, number | null> = Object.fromEntries(
    bucketedTimestamps.map((bucketKey) => [bucketKey, blockNumberCache.get(bucketKey.toString())]),
  )

  // 3. Identify which bucketKeys are not yet cached
  //    Use a Set to avoid duplicates if multiple timestamps land in the same bucket
  const missingBucketKeys = [...new Set(bucketedTimestamps.filter((bucketKey) => bucketedMap[bucketKey] == null))].sort(
    (a, b) => a - b,
  )

  // If everything is in the cache, we can skip fetching
  if (missingBucketKeys.length === 0) {
    return bucketedTimestamps.map((bucketKey) => bucketedMap[bucketKey] as number)
  }

  // 4. Fetch block numbers for the missing bucket keys
  const missingBlocks = await Promise.all(
    missingBucketKeys.map(async (bucketKey) => ({
      timestamp: bucketKey.toString(),
      number: await getBlockNumberOfTimestamp(bucketKey * 1000).then(Number),
    })),
  )

  // 5. Verify we got back the same number of blocks as missing keys
  if (missingBlocks.length !== missingBucketKeys.length) {
    throw new Error('Missing blocks')
  }

  // 6. Store each fetched block in both the local map and the LRU cache
  missingBlocks.forEach(({ timestamp, number }) => {
    blockNumberCache.put(timestamp, number)
    bucketedMap[timestamp] = number
  })

  // 7. Finally, return the block numbers in the same order as `timestamps`
  //    by looking up their bucketed key in `bucketedMap`.
  return bucketedTimestamps.map((bucketKey) => bucketedMap[bucketKey] as number)
}

export async function getBucketedBlockNumber(timestamp: number, { bucketSize = 1 } = {}) {
  // 1. Convert the original (ms) timestamp to its bucketed (sec) equivalent
  const bucketedTimestamp = bucketTimestamp(timestamp, { bucketSize })

  // 2. Check cache for the bucketed timestamp
  const cachedBlockNumber = blockNumberCache.get(bucketedTimestamp.toString())

  // If it's in the cache, return it
  if (cachedBlockNumber != null) {
    return {
      timestamp: bucketedTimestamp,
      blockNumber: cachedBlockNumber,
      toBeCached: false,
    }
  }

  // Otherwise, fetch the block number and store it in the cache
  const blockNumber = await getBlockNumberOfTimestamp(bucketedTimestamp * 1000).then(Number)

  const toBeCached = bucketedTimestamp === bucketTimestamp(bucketedTimestamp * 1000)

  if (toBeCached) {
    blockNumberCache.put(bucketedTimestamp.toString(), blockNumber)
  }

  return {
    timestamp: bucketedTimestamp,
    blockNumber,
    toBeCached,
  }
}
