import { WKAIA_ADDRESS } from '@pancakeswap/uikit'
import { TokenSimple } from 'lib/graph-queries/types'

export function wkaiaToKaia(token: TokenSimple) {
  if (token.id.toLowerCase() === WKAIA_ADDRESS.toLowerCase()) {
    return {
      ...token,
      symbol: 'KAIA',
      name: 'Kaia',
    }
  }

  return token
}
