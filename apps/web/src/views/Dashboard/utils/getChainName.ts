import { ChainId } from '@pancakeswap/chains'

export default function getChainName(chainId: ChainId) {
  switch (chainId) {
    default:
      return 'KLAYTN' as const
  }
}
