import { WKAIA_ADDRESS } from '@pancakeswap/uikit'
import { TokenSimple } from 'lib/graph-queries/types'

export function wkaiaToKaia<T extends TokenSimple>(token: T) {
  if (token.id.toLowerCase() === WKAIA_ADDRESS.toLowerCase()) {
    return {
      ...token,
      symbol: 'KAIA',
      name: 'Kaia',
    }
  }

  return token
}
