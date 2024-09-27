import { ChainId } from '@pancakeswap/chains'
import { ERC20Token, Token, WNATIVE } from '@pancakeswap/sdk'
import {
  BUSD,
  USDC,
  USDT,
  WBTC_ETH,
  bscTestnetTokens,
  bscTokens,
  ethereumTokens,
  klaytnTestnetTokens,
  klaytnTokens,
} from '@pancakeswap/tokens'

import { ChainMap, ChainTokenList } from '../types'

// DEV_NOTE [체인설정]_7-3 : swap router 주소 설정
export const SMART_ROUTER_ADDRESSES = {
  [ChainId.ETHEREUM]: '0x13f4EA83D0bd40E75C8222255bc855a974568Dd4',
  [ChainId.GOERLI]: '0x9a489505a00cE272eAa5e07Dba6491314CaE3796',
  [ChainId.BSC]: '0x13f4EA83D0bd40E75C8222255bc855a974568Dd4',
  [ChainId.BSC_TESTNET]: '0x9a489505a00cE272eAa5e07Dba6491314CaE3796',
  [ChainId.KLAYTN]: '0x5EA3e22C41B08DD7DC7217549939d987ED410354',
  [ChainId.KLAYTN_TESTNET]: '0x01be01B4bBb24e127640dE1973520F588EBc7c39',
} as const satisfies Record<ChainId, string>

export const V2_ROUTER_ADDRESS: ChainMap<string> = {
  [ChainId.ETHEREUM]: '0xEfF92A263d31888d860bD50809A8D171709b7b1c',
  [ChainId.GOERLI]: '0xEfF92A263d31888d860bD50809A8D171709b7b1c',
  [ChainId.BSC]: '0x10ED43C718714eb63d5aA57B78B54704E256024E',
  [ChainId.BSC_TESTNET]: '0xD99D1c33F9fC3444f8101754aBC46c52416550D1',
  [ChainId.KLAYTN]: '0x8203cBc504CE43c3Cad07Be0e057f25B1d4DB578',
  [ChainId.KLAYTN_TESTNET]: '0x85de4a8813c8856b3F19256d0a2EB860975B00C9',
}

export const STABLE_SWAP_INFO_ADDRESS: ChainMap<string> = {
  [ChainId.ETHEREUM]: '',
  [ChainId.GOERLI]: '',
  [ChainId.BSC]: '0xa680d27f63Fa5E213C502d1B3Ca1EB6a3C1b31D6',
  [ChainId.BSC_TESTNET]: '0xaE6C14AAA753B3FCaB96149e1E10Bc4EDF39F546',
  [ChainId.KLAYTN]: '',
  [ChainId.KLAYTN_TESTNET]: '',
}

// used to construct intermediary pairs for trading
export const BASES_TO_CHECK_TRADES_AGAINST: ChainTokenList = {
  [ChainId.ETHEREUM]: [WNATIVE[ChainId.ETHEREUM], USDC[ChainId.ETHEREUM], USDT[ChainId.ETHEREUM], WBTC_ETH],
  [ChainId.GOERLI]: [WNATIVE[ChainId.GOERLI], USDC[ChainId.GOERLI], BUSD[ChainId.GOERLI]],
  [ChainId.BSC]: [
    bscTokens.wbnb,
    bscTokens.cake,
    bscTokens.busd,
    bscTokens.usdt,
    bscTokens.btcb,
    bscTokens.eth,
    bscTokens.usdc,
  ],
  [ChainId.BSC_TESTNET]: [bscTestnetTokens.wbnb, bscTestnetTokens.cake, bscTestnetTokens.busd],
  [ChainId.KLAYTN]: [klaytnTokens.weth, klaytnTokens.usdt],
  [ChainId.KLAYTN_TESTNET]: [klaytnTestnetTokens.usdt, klaytnTestnetTokens.weth],
}

const czusd = new ERC20Token(ChainId.BSC, '0xE68b79e51bf826534Ff37AA9CeE71a3842ee9c70', 18, 'CZUSD', 'CZUSD')

/**
 * Additional bases for specific tokens
 * @example { [WBTC.address]: [renBTC], [renBTC.address]: [WBTC] }
 */
export const ADDITIONAL_BASES: {
  [chainId in ChainId]?: { [tokenAddress: string]: Token[] }
} = {
  [ChainId.BSC]: {
    // SNFTS-SFUND
    [bscTokens.snfts.address]: [bscTokens.sfund],

    [bscTokens.ankr.address]: [bscTokens.ankrbnb],
    [bscTokens.ankrbnb.address]: [bscTokens.ankrETH, bscTokens.ankr],
    [bscTokens.ankrETH.address]: [bscTokens.ankrbnb],

    // REVV - EDU
    [bscTokens.revv.address]: [bscTokens.edu],
    [bscTokens.edu.address]: [bscTokens.revv],
    // unshETH - USH
    [bscTokens.unshETH.address]: [bscTokens.ush],
    [bscTokens.ush.address]: [bscTokens.unshETH],

    [bscTokens.tusd.address]: [bscTokens.usdd],
    [bscTokens.usdd.address]: [bscTokens.tusd],

    // pancakeswap/pancake-frontend#7909
    // LSDT
    '0xAa83Bb1Be2a74AaA8795a8887054919A0Ea96BFA': [czusd],
    // GEM
    '0x701F1ed50Aa5e784B8Fb89d1Ba05cCCd627839a7': [czusd],
    // DOGD
    '0x99F4cc2BAE97F82A823CA80DcAe52EF972B7F270': [czusd],
  },
  [ChainId.ETHEREUM]: {
    // alETH - ALCX
    [ethereumTokens.alcx.address]: [ethereumTokens.alETH],
    [ethereumTokens.alETH.address]: [ethereumTokens.alcx],

    // rETH - ETH
    [ethereumTokens.weth.address]: [ethereumTokens.rETH],
  },
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
} = {
  [ChainId.BSC]: {
    [bscTokens.axlusdc.address]: [bscTokens.usdt],
  },
}
