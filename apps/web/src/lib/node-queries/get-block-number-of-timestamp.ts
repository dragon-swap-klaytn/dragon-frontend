import { getBlockNumber } from 'lib/node-queries/get-block-number'
import { getBlockTimestampMS } from 'lib/node-queries/get-block-timestamp-ms'
import { BlockNotFoundError } from 'viem'

function bigIntAbs(value: bigint) {
  return value < 0n ? -value : value
}

export const getBlockNumberOfTimestamp = async (
  timestampInMS: number,
  {
    start,
  }: {
    start?: { blockNumber: bigint; timestamp: number }
  } = {},
) => {
  let baseBN: bigint
  let baseTS: number

  // 1) Choose a base block. If provided via `start`, use that.
  //    Otherwise, use the current block number & its timestamp.
  if (start) {
    baseBN = start.blockNumber
    baseTS = start.timestamp
  } else {
    baseBN = await getBlockNumber()
    baseTS = await getBlockTimestampMS(baseBN).catch((err) => {
      if (err instanceof BlockNotFoundError) {
        return Date.now()
      }

      throw err
    })
  }

  // 2) If the target timestamp is *later* than the base timestamp,
  //    we throw an error. (i.e., we assume the base block is already
  //    older or equal in time to the target)
  if (timestampInMS > baseTS) {
    return baseBN
  }

  // 3) Force the target timestamp to a multiple of 1000 ms:
  const targetTS = Math.ceil(timestampInMS / 1000) * 1000

  // 4) Initial diff (in seconds) between the target and the base
  let tries = 0
  let diff = BigInt(Math.floor((targetTS - baseTS) / 1000))

  // 5) Based on the (time) diff, guess an approximate block number
  //    from the base block/time. This is *floating point*:
  let blockNumber = baseBN + diff
  let fallbackBlockNumber = 1n

  // 6) Iteratively refine up to 5 times.
  while (tries++ < 5) {
    // eslint-disable-next-line no-await-in-loop
    const blockTS = await getBlockTimestampMS(blockNumber)
    const newDiff = BigInt(Math.floor((targetTS - blockTS) / 1000))

    if (blockTS >= targetTS && blockNumber > fallbackBlockNumber) {
      fallbackBlockNumber = blockNumber
    }

    // Cases where we “cross” the timestamp boundary.
    if (diff < 0 && newDiff <= 0) {
      return blockNumber
    }
    if (diff > 0 && newDiff >= 0) {
      return blockNumber
    }

    // If the new diff didn’t improve, bail out with a half-step adjustment
    if (bigIntAbs(newDiff) >= bigIntAbs(diff)) {
      return BigInt(Math.ceil(Number(blockNumber) + Number(newDiff) / 2))
    }

    // Otherwise, continue adjusting.
    diff = newDiff
    blockNumber += diff
  }

  // If we reach here, we couldn’t find a block number.
  return fallbackBlockNumber
}
