import { ChainId } from '@pancakeswap/chains'

export const verifyBscNetwork = (chainId?: number) => {
  return Boolean(chainId && (chainId === ChainId.KLAYTN || chainId === ChainId.KLAYTN_TESTNET))
}
