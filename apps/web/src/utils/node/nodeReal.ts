import { ChainId } from '@pancakeswap/chains'

export const getNodeRealUrl = (chainId: number, key?: string) => {
  let host: string | null = null

  switch (chainId) {
    case ChainId.ETHEREUM:
      if (key) {
        host = `eth-mainnet.nodereal.io/v1/${key}`
      }
      break
    case ChainId.GOERLI:
      if (key) {
        host = `eth-goerli.nodereal.io/v1/${key}`
      }
      break
    case ChainId.BSC:
      if (key) {
        host = `bsc-mainnet.nodereal.io/v1/${key}`
      }
      break
    default:
      host = null
  }

  if (!host) {
    return null
  }

  const url = `https://${host}`
  return url
}
