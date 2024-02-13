import { ChainId } from '@pancakeswap/chains'
import { farmsV3 as bscFarm } from '@pancakeswap/farms/constants/bsc'
import { farmsV3 as farm97 } from '@pancakeswap/farms/constants/bscTestnet'
import { farmsV3 as ethFarm } from '@pancakeswap/farms/constants/eth'
import { farmsV3 as farm5 } from '@pancakeswap/farms/constants/goerli'
import { ComputedFarmConfigV3, FarmV3SupportedChainId } from '@pancakeswap/farms/src'
import { tradingRewardV3Pair as tradingRewardV3Pair56 } from './56'

// DEV_NOTE [체인설정]_11 : farm list
export const tradingRewardPairConfigChainMap: Record<FarmV3SupportedChainId, ComputedFarmConfigV3[]> = {
  [ChainId.ETHEREUM]: ethFarm,
  [ChainId.GOERLI]: farm5,
  [ChainId.BSC]: [...bscFarm, ...tradingRewardV3Pair56],
  [ChainId.BSC_TESTNET]: farm97,
  [ChainId.KLAYTN]: [],
  [ChainId.KLAYTN_TESTNET]: [],
}
