import { ChainId } from '@pancakeswap/chains'
import { Address } from 'viem'
import { FarmV3SupportedChainId } from '../../src'
import { ComputedFarmConfigV3 } from '../../src/types'
import { farmsV3 as bscFarms } from '../bsc'
import { farmsV3 as bscTestnetFarms } from '../bscTestnet'
import { farmsV3 as ethFarms } from '../eth'
import { farmsV3 as goerliFarms } from '../goerli'
import { farmsV3 as klaytnFarms } from '../klaytn'
import { farmsV3 as klaytnTestnetFarms } from '../klaytnTestnet'

// DEV_NOTE [체인설정]_11-1 : default farms
export const farmsV3ConfigChainMap: Record<FarmV3SupportedChainId, ComputedFarmConfigV3[]> = {
  [ChainId.ETHEREUM]: ethFarms,
  [ChainId.GOERLI]: goerliFarms,
  [ChainId.BSC]: bscFarms,
  [ChainId.BSC_TESTNET]: bscTestnetFarms,
  [ChainId.KLAYTN]: klaytnFarms,
  [ChainId.KLAYTN_TESTNET]: klaytnTestnetFarms,
}

export type Addresses = {
  [chainId in ChainId]?: Address
}

export const bCakeFarmBoosterV3Address: Addresses = {
  [ChainId.BSC]: '0x695170faE243147b3bEB4C43AA8DE5DcD9202752',
  [ChainId.BSC_TESTNET]: '0x56666300A1E25624489b661f3C6c456c159a109a',
}
export const bCakeFarmBoosterVeCakeAddress: Addresses = {
  [ChainId.BSC]: '0x625F45234D6335859a8b940960067E89476300c6',
  [ChainId.BSC_TESTNET]: '0x1F32591CC45f00BaE3A742Bf2bCAdAe59DbAd228',
}
