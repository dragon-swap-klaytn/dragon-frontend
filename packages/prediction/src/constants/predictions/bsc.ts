import { ChainId } from '@pancakeswap/chains'
import { Native } from '@pancakeswap/sdk'
import { bscTokens } from '@pancakeswap/tokens'
import { chainlinkOracleBNB, chainlinkOracleCAKE } from '../../chainlinkOracleContract'
import { GRAPH_API_PREDICTION_BNB, GRAPH_API_PREDICTION_CAKE } from '../../endpoints'
import { predictionsBNB, predictionsCAKE } from '../../predictionContract'
import { PredictionConfig, PredictionSupportedSymbol } from '../../type'

export const predictions: Record<string, PredictionConfig> = {
  [PredictionSupportedSymbol.BNB]: {
    isNativeToken: true,
    address: predictionsBNB[ChainId.KLAYTN],
    api: GRAPH_API_PREDICTION_BNB[ChainId.KLAYTN],
    chainlinkOracleAddress: chainlinkOracleBNB[ChainId.KLAYTN],
    displayedDecimals: 4,
    token: Native.onChain(ChainId.KLAYTN),
    tokenBackgroundColor: '#F0B90B',
  },
  [PredictionSupportedSymbol.CAKE]: {
    isNativeToken: false,
    address: predictionsCAKE[ChainId.KLAYTN],
    api: GRAPH_API_PREDICTION_CAKE[ChainId.KLAYTN],
    chainlinkOracleAddress: chainlinkOracleCAKE[ChainId.KLAYTN],
    displayedDecimals: 4,
    token: bscTokens.cake,
    tokenBackgroundColor: '#25C7D6',
  },
}
