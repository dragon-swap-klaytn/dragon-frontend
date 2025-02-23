import { ChainId } from '@pancakeswap/chains'
import { ERC20Token, Token } from '@pancakeswap/sdk'
import { klaytnTestnetTokens, klaytnTokens } from '@pancakeswap/tokens'

import { ChainMap, ChainTokenList } from '../types'

// DEV_NOTE [체인설정]_7-3 : swap router 주소 설정
export const SMART_ROUTER_ADDRESSES = {
  [ChainId.KLAYTN]: '0x5EA3e22C41B08DD7DC7217549939d987ED410354',
  [ChainId.KLAYTN_TESTNET]: '0x01be01B4bBb24e127640dE1973520F588EBc7c39',
} as const satisfies Record<ChainId, string>

export const V2_ROUTER_ADDRESS: ChainMap<string> = {
  [ChainId.KLAYTN]: '0x8203cBc504CE43c3Cad07Be0e057f25B1d4DB578',
  [ChainId.KLAYTN_TESTNET]: '0x85de4a8813c8856b3F19256d0a2EB860975B00C9',
}

export const STABLE_SWAP_INFO_ADDRESS: ChainMap<string> = {
  [ChainId.KLAYTN]: '',
  [ChainId.KLAYTN_TESTNET]: '',
}

// used to construct intermediary pairs for trading
export const BASES_TO_CHECK_TRADES_AGAINST: ChainTokenList = {
  [ChainId.KLAYTN]: [klaytnTokens.weth, klaytnTokens.usdt],
  [ChainId.KLAYTN_TESTNET]: [klaytnTestnetTokens.usdt, klaytnTestnetTokens.weth],
}

/**
 * Additional bases for specific tokens
 * @example { [WBTC.address]: [renBTC], [renBTC.address]: [WBTC] }
 */
export const ADDITIONAL_BASES: {
  [chainId in ChainId]?: { [tokenAddress: string]: Token[] }
} = {
  [ChainId.KLAYTN]: {
    '0x608E8512d31cAE43Cd8058D81E6B56203A112539': [
      // PING
      new ERC20Token(ChainId.KLAYTN, '0xB242cb981952C183421E4aC9B0D4861c27D9Dc73', 18, 'DrumPing', 'DPING', ''),
      new ERC20Token(ChainId.KLAYTN, '0x4Cad05F5AfDD4bfC072E356e88B05C33316bb1c5', 18, 'SeryukPing', 'KPING', ''),
      new ERC20Token(ChainId.KLAYTN, '0x8882ec400E9348ff60Ae85d3D90A93cF97Ce8869', 18, 'MultaPing', 'MPING', ''),
    ],
    '0xB242cb981952C183421E4aC9B0D4861c27D9Dc73': [
      // DPING
      new ERC20Token(ChainId.KLAYTN, '0x608E8512d31cAE43Cd8058D81E6B56203A112539', 18, 'BirdsPing', 'PING', ''),
      new ERC20Token(ChainId.KLAYTN, '0x4Cad05F5AfDD4bfC072E356e88B05C33316bb1c5', 18, 'SeryukPing', 'KPING', ''),
      new ERC20Token(ChainId.KLAYTN, '0x8882ec400E9348ff60Ae85d3D90A93cF97Ce8869', 18, 'MultaPing', 'MPING', ''),
    ],
    '0x4Cad05F5AfDD4bfC072E356e88B05C33316bb1c5': [
      // KPING
      new ERC20Token(ChainId.KLAYTN, '0x608E8512d31cAE43Cd8058D81E6B56203A112539', 18, 'BirdsPing', 'PING', ''),
      new ERC20Token(ChainId.KLAYTN, '0xB242cb981952C183421E4aC9B0D4861c27D9Dc73', 18, 'DrumPing', 'DPING', ''),
      new ERC20Token(ChainId.KLAYTN, '0x8882ec400E9348ff60Ae85d3D90A93cF97Ce8869', 18, 'MultaPing', 'MPING', ''),
    ],
    '0x8882ec400E9348ff60Ae85d3D90A93cF97Ce8869': [
      // MPING
      new ERC20Token(ChainId.KLAYTN, '0x608E8512d31cAE43Cd8058D81E6B56203A112539', 18, 'BirdsPing', 'PING', ''),
      new ERC20Token(ChainId.KLAYTN, '0xB242cb981952C183421E4aC9B0D4861c27D9Dc73', 18, 'DrumPing', 'DPING', ''),
      new ERC20Token(ChainId.KLAYTN, '0x8882ec400E9348ff60Ae85d3D90A93cF97Ce8869', 18, 'MultaPing', 'MPING', ''),
    ],
  },
}

/**
 * Some tokens can only be swapped via certain pairs, so we override the list of bases that are considered for these
 * tokens.
 * @example [AMPL.address]: [DAI, WNATIVE[ChainId.BSC]]
 */
export const CUSTOM_BASES: {
  [chainId in ChainId]?: { [tokenAddress: string]: Token[] }
} = {}
