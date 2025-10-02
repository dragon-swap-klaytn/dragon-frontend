import { ChainId } from '@pancakeswap/chains'
import { localCachedV2 } from 'utils/localCachedV2'
import { getViemClients } from 'utils/viem.server'

const publicClient = getViemClients({ chainId: ChainId.KLAYTN })

export const getFreshBlockNumberFromPublicNode = async () => {
  return publicClient.getBlockNumber()
}

export const getFreshBlockNumberFromSwapscanner = async () => {
  const { blockNumber } = await fetch('https://api.swapscanner.io/api/v0/dg-swap/blockNumber').then((res) => res.json())

  return BigInt(blockNumber)
}

export const getFreshBlockNumber = async () => {
  try {
    // use only swapscanner for now
    // const blockNumber = await Promise.any([getFreshBlockNumberFromPublicNode(), getFreshBlockNumberFromSwapscanner()])
    const blockNumber = await getFreshBlockNumberFromSwapscanner()
    return blockNumber
  } catch (error) {
    console.error('All promises failed to resolve', error)
    throw new Error('Could not fetch block number from any source.')
  }
}

const createTimeoutPromise = async (ms: number): Promise<never> =>
  new Promise((_, reject) => setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms))

export const getFreshBlockNumberWithTimeout = async () => {
  return Promise.race([getFreshBlockNumber(), createTimeoutPromise(5_000)])
}

// 최종적으로 캐싱할 함수는 타임아웃이 적용된 함수여야 합니다.
export const getBlockNumber = localCachedV2(getFreshBlockNumberWithTimeout, {
  ttl: 5_000,
  ttlOnCatch: 1_000,
}).cachedFetcher
