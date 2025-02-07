import { viemClients } from 'utils/viem'

const publicClient = viemClients[8217]

export const getBlockTimestampMS = async (blockNumber: bigint) => {
  const { timestamp } = await publicClient.getBlock({ blockNumber })
  return Number(timestamp) * 1000
}
