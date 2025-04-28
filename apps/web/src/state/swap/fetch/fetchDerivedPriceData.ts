import { ChainId } from '@pancakeswap/chains'
import request from 'graphql-request'
import { getTVL } from '../queries/getDerivedPrices'

const PROTOCOL = ['v2', 'v3', 'stable'] as const
type Protocol = (typeof PROTOCOL)[number]

type ProtocolEndpoint = Record<Protocol, string>

// DEV_NOTE [체인설정]_10-1 : swap info subgraph url
const SWAP_INFO_BY_CHAIN: {
  [chainId in ChainId]: Partial<ProtocolEndpoint>
} = {
  [ChainId.KLAYTN]: {},
  [ChainId.KLAYTN_TESTNET]: {},
} satisfies Record<ChainId, Partial<ProtocolEndpoint>>

export const getTokenBestTvlProtocol = async (tokenAddress: string, chainId: ChainId): Promise<Protocol | null> => {
  const infos = SWAP_INFO_BY_CHAIN[chainId]
  if (infos) {
    const [v2, v3, stable] = await Promise.allSettled([
      'v2' in infos ? request(infos.v2, getTVL(tokenAddress.toLowerCase())) : Promise.resolve(),
      'v3' in infos ? request(infos.v3, getTVL(tokenAddress.toLowerCase(), true)) : Promise.resolve(),
      'stable' in infos ? request(infos.stable, getTVL(tokenAddress.toLowerCase())) : Promise.resolve(),
    ])

    const results = [v2, v3, stable]
    let bestProtocol: Protocol = 'v2'
    let bestTVL = 0
    for (const [index, result] of results.entries()) {
      if (result.status === 'fulfilled' && result.value && result.value.token) {
        if (+result.value.token.totalValueLocked > bestTVL) {
          bestTVL = +result.value.token.totalValueLocked
          bestProtocol = PROTOCOL[index]
        }
      }
    }

    return bestProtocol
  }

  return null
}
