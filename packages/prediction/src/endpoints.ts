import { ChainId } from '@pancakeswap/chains'
import { SupportedChainId } from './constants/supportedChains'
import { EndPointType } from './type'

export const GRAPH_API_PREDICTION_BNB = {
  [ChainId.KLAYTN]: '',
} as const satisfies EndPointType<SupportedChainId>

export const GRAPH_API_PREDICTION_CAKE = {
  [ChainId.KLAYTN]: '',
} as const satisfies EndPointType<SupportedChainId>

export const GRAPH_API_PREDICTION_ETH = {
  [ChainId.KLAYTN]: '',
} as const satisfies EndPointType<SupportedChainId>
