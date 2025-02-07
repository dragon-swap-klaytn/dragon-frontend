import { localCachedV2 } from 'utils/localCachedV2'
import { viemClients } from 'utils/viem'

const publicClient = viemClients[8217]

export const getFreshBlockNumber = async () => {
  return publicClient.getBlockNumber()
}

export const getBlockNumber = localCachedV2(getFreshBlockNumber, {
  ttl: 1_000,
  ttlOnCatch: 1_000,
}).cachedFetcher
