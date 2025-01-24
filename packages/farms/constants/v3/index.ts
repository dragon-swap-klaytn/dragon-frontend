import { ChainId } from '@pancakeswap/chains'
import { Address } from 'viem'
import { FarmV3SupportedChainId } from '../../src'
import { ComputedFarmConfigV3 } from '../../src/types'
import { farmsV3 as klaytnFarms, farmsV3Finished as klaytnFinishedFarms } from '../kaia'
import { farmsV3 as klaytnTestnetFarms } from '../kairos'

// DEV_NOTE [체인설정]_11-1 : default farms
export const farmsV3ConfigChainMap: Record<FarmV3SupportedChainId, ComputedFarmConfigV3[]> = {
  [ChainId.KLAYTN]: klaytnFarms,
  [ChainId.KLAYTN_TESTNET]: klaytnTestnetFarms,
}

export const farmsV3FinishedConfigChainMap: Record<number, ComputedFarmConfigV3[]> = {
  [ChainId.KLAYTN]: klaytnFinishedFarms,
}

export type Addresses = {
  [chainId in ChainId]?: Address
}

export const bCakeFarmBoosterV3Address: Addresses = {
  [ChainId.KLAYTN]: '0x',
  [ChainId.KLAYTN_TESTNET]: '0x',
}
export const bCakeFarmBoosterVeCakeAddress: Addresses = {
  [ChainId.KLAYTN]: '0x',
  [ChainId.KLAYTN_TESTNET]: '0x',
}
