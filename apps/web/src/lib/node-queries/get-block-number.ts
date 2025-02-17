import { ChainId } from '@pancakeswap/chains'
import { localCachedV2 } from 'utils/localCachedV2'
import { getViemClients } from 'utils/viem.server'

const publicClient = getViemClients({ chainId: ChainId.KLAYTN })

export const getFreshBlockNumber = async () => {
  return publicClient.getBlockNumber()
}

export const getBlockNumber = localCachedV2(getFreshBlockNumber, {
  ttl: 1_000,
  ttlOnCatch: 1_000,
}).cachedFetcher
