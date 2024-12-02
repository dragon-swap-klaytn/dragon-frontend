import { ChainId } from '@pancakeswap/chains'
import { Token } from '@pancakeswap/sdk'
import { getTokenLogoFromSs } from '@pancakeswap/widgets-internal'
import memoize from 'lodash/memoize'
import { safeGetAddress } from 'utils'
import { isAddress } from 'viem'

const mapping = {
  [ChainId.BSC]: 'smartchain',
  [ChainId.ETHEREUM]: 'ethereum',
  [ChainId.KLAYTN]: 'klaytn',
}

const getTokenLogoURL = memoize(
  (token?: Token) => {
    if (token && mapping[token.chainId] && isAddress(token.address)) {
      return getTokenLogoFromSs(token)
    }
    return null
  },
  (t) => `${t?.chainId}#${t?.address}`,
)

export const getTokenLogoURLByAddress = memoize(
  (address?: string, chainId?: number) => {
    if (address && chainId && mapping[chainId] && isAddress(address)) {
      return `https://assets-cdn.trustwallet.com/blockchains/${mapping[chainId]}/assets/${safeGetAddress(
        address,
      )}/logo.png`
    }
    return null
  },
  (address, chainId) => `${chainId}#${address}`,
)

export default getTokenLogoURL
