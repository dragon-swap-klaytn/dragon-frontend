import { ChainId } from '@pancakeswap/chains'

const pocketPrefix = {
  [ChainId.BSC]: 'bsc-mainnet',
  [ChainId.ETHEREUM]: 'eth-mainnet',
  [ChainId.KLAYTN]: 'klaytn-mainnet',
} as const

export const getPoktUrl = (chainId: keyof typeof pocketPrefix, key?: string) => {
  if (!key) {
    return null
  }

  const url = `https://${pocketPrefix[chainId]}.gateway.pokt.network/v1/lb/${key}`
  return url
}

export const getGroveUrl = (chainId: keyof typeof pocketPrefix, key?: string) => {
  if (!key) {
    return null
  }

  const url = `https://${pocketPrefix[chainId]}.rpc.grove.city/v1/${key}`
  return url
}
