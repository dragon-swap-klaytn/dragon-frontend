import { ChainId } from '@pancakeswap/chains'
import { CONFIG_PROD } from './prod'
import { CONFIG_TESTNET } from './testnet'

export const GAUGES_CONFIG = {
  [ChainId.KLAYTN]: CONFIG_PROD,
  [ChainId.KLAYTN_TESTNET]: CONFIG_TESTNET,
}
