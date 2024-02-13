import {ChainId} from '@pancakeswap/chains'
import uniq from 'lodash/uniq'

// DEV_NOTE [체인설정]_5 : farm supportedChainId 설정
export const supportedChainIdV2 = [ChainId.GOERLI, ChainId.BSC, ChainId.BSC_TESTNET, ChainId.ETHEREUM, ChainId.KLAYTN, ChainId.KLAYTN_TESTNET] as const
export const supportedChainIdV3 = [
  ChainId.GOERLI,
  ChainId.BSC,
  ChainId.BSC_TESTNET,
  ChainId.ETHEREUM,
  ChainId.KLAYTN,
  ChainId.KLAYTN_TESTNET,
] as const
export const supportedChainId = uniq([...supportedChainIdV2, ...supportedChainIdV3])
export const bCakeSupportedChainId = [ChainId.BSC] as const

export const FARM_AUCTION_HOSTING_IN_SECONDS = 691200

export type FarmSupportedChainId = (typeof supportedChainId)[number]

export type FarmV2SupportedChainId = (typeof supportedChainIdV2)[number]

export type FarmV3SupportedChainId = (typeof supportedChainIdV3)[number]

export const masterChefAddresses = {
  [ChainId.BSC_TESTNET]: '0xB4A466911556e39210a6bB2FaECBB59E4eB7E43d',
  [ChainId.BSC]: '0xa5f8C5Dbd5F286960b9d90548680aE5ebFf07652',
  [ChainId.KLAYTN]: '0x403050782bFeedE42c002cE26525a790f2c69615',
  [ChainId.KLAYTN_TESTNET]: '0x566da88915575161ec59E66fd04af3B9C5d08A77',
} as const

// DEV_NOTE [체인설정]_7-1 : masterchef
export const masterChefV3Addresses = {
  [ChainId.ETHEREUM]: '0x556B9306565093C855AEA9AE92A594704c2Cd59e',
  [ChainId.GOERLI]: '0x864ED564875BdDD6F421e226494a0E7c071C06f8',
  [ChainId.BSC]: '0x556B9306565093C855AEA9AE92A594704c2Cd59e',
  [ChainId.BSC_TESTNET]: '0x4c650FB471fe4e0f476fD3437C3411B1122c4e3B',
  [ChainId.KLAYTN]: '0xa120A272a90C39e3E932ef2D18cb6d45E7485F7d',
  [ChainId.KLAYTN_TESTNET]: '0x084B5eF28B51aEB6D5De82140eA5f8FeA52B70ab',
} as const satisfies Record<FarmV3SupportedChainId, string>

export const nonBSCVaultAddresses = {
  [ChainId.ETHEREUM]: '0x2e71B2688019ebdFDdE5A45e6921aaebb15b25fb',
  [ChainId.GOERLI]: '0xE6c904424417D03451fADd6E3f5b6c26BcC43841',
} as const
