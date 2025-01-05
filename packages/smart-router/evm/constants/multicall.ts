import { ChainId } from '@pancakeswap/chains'

import { BatchMulticallConfigs, ChainMap } from '../types'

const DEFAULT: BatchMulticallConfigs = {
  defaultConfig: {
    gasLimitPerCall: 1_000_000,
  },
  gasErrorFailureOverride: {
    gasLimitPerCall: 2_000_000,
  },
  successRateFailureOverrides: {
    gasLimitPerCall: 2_000_000,
  },
}

// DEV_NOTE [체인설정]_13 : multicall batch config
export const BATCH_MULTICALL_CONFIGS: ChainMap<BatchMulticallConfigs> = {
  [ChainId.KLAYTN]: DEFAULT,
  [ChainId.KLAYTN_TESTNET]: DEFAULT,
}
