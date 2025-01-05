import { ChainId } from './chainId'

// DEV_NOTE [체인설정]_12 : chain name 설정

export const chainNames: Record<ChainId, string> = {
  [ChainId.KLAYTN]: 'Kaia',
  [ChainId.KLAYTN_TESTNET]: 'Kairos',
}

export const chainNameToChainId = Object.entries(chainNames).reduce((acc, [chainId, chainName]) => {
  return {
    [chainName]: chainId as unknown as ChainId,
    ...acc,
  }
}, {} as Record<string, ChainId>)

// @see https://github.com/DefiLlama/defillama-server/blob/master/common/chainToCoingeckoId.ts
// @see https://github.com/DefiLlama/chainlist/blob/main/constants/chainIds.json
export const defiLlamaChainNames: Record<ChainId, string> = {
  [ChainId.KLAYTN]: 'Kaia',
  [ChainId.KLAYTN_TESTNET]: 'Kairos',
}
