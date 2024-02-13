import {
  BLOCKS_CLIENT,
  BLOCKS_CLIENT_ETH,
  BLOCKS_CLIENT_KLAYTN,
  BLOCKS_CLIENT_KLAYTN_TESTNET,
} from 'config/constants/endpoints'
import { GraphQLClient } from 'graphql-request'
import { infoClient, infoClientETH, infoStableSwapClients, v2Clients } from 'utils/graphql'

import { ChainId } from '@pancakeswap/chains'
import {
  BSC_TOKEN_WHITELIST,
  ETH_TOKEN_BLACKLIST,
  ETH_TOKEN_WHITELIST,
  PCS_ETH_START,
  PCS_V2_START,
  TOKEN_BLACKLIST,
} from 'config/constants/info'
import mapValues from 'lodash/mapValues'
import { klaytn } from 'viem/chains'
import { bsc, mainnet } from 'wagmi/chains'

export type MultiChainName = 'BSC' | 'ETH' | 'KLAYTN' | 'KLAYTN_TESTNET'

export type MultiChainNameExtend = MultiChainName | 'BSC_TESTNET'

export const multiChainName: Record<number | string, MultiChainNameExtend> = {
  [ChainId.BSC]: 'BSC',
  [ChainId.ETHEREUM]: 'ETH',
  [ChainId.BSC_TESTNET]: 'BSC_TESTNET',
}

export const multiChainShortName: Record<number, string> = {}

export const multiChainQueryMainToken: Record<MultiChainName, string> = {
  BSC: 'BNB',
  ETH: 'ETH',
  KLAYTN: 'ETH',
  KLAYTN_TESTNET: 'ETH',
}

export const multiChainBlocksClient: Record<MultiChainNameExtend, string> = {
  BSC: BLOCKS_CLIENT,
  ETH: BLOCKS_CLIENT_ETH,
  KLAYTN: BLOCKS_CLIENT_KLAYTN,
  KLAYTN_TESTNET: BLOCKS_CLIENT_KLAYTN_TESTNET,
  BSC_TESTNET: 'https://api.thegraph.com/subgraphs/name/lengocphuc99/bsc_testnet-blocks',
}

export const multiChainStartTime = {
  BSC: PCS_V2_START,
  ETH: PCS_ETH_START,
  KLAYTN: 145315220,
  KLAYTN_TESTNET: 144998615,
}

export const multiChainId: Record<MultiChainName, ChainId> = {
  BSC: ChainId.BSC,
  ETH: ChainId.ETHEREUM,
  KLAYTN: ChainId.KLAYTN,
  KLAYTN_TESTNET: ChainId.KLAYTN_TESTNET,
}

export const multiChainPaths = {
  [ChainId.BSC]: '',
  [ChainId.ETHEREUM]: '/eth',
  [ChainId.KLAYTN]: '/klaytn',
}

export const multiChainQueryClient = {
  BSC: infoClient,
  ETH: infoClientETH,
  KLAYTN: v2Clients[ChainId.KLAYTN],
  KLAYTN_TESTNET: v2Clients[ChainId.KLAYTN_TESTNET],
}

export const multiChainQueryStableClient = {
  BSC: infoStableSwapClients[ChainId.BSC],
  KLAYTN: v2Clients[ChainId.KLAYTN],
  KLAYTN_TESTNET: v2Clients[ChainId.KLAYTN_TESTNET],
}

export const STABLESWAP_SUBGRAPHS_START_BLOCK = {}

export const multiChainScan: Record<MultiChainName, string> = {
  BSC: bsc.blockExplorers.etherscan.name,
  ETH: mainnet.blockExplorers.etherscan.name,
  KLAYTN: klaytn.blockExplorers.etherscan.name,
  KLAYTN_TESTNET: 'KlaytnScope',
}

export const multiChainTokenBlackList: Record<MultiChainName, string[]> = mapValues(
  {
    BSC: TOKEN_BLACKLIST,
    ETH: ETH_TOKEN_BLACKLIST,
    KLAYTN: [],
    KLAYTN_TESTNET: [],
  },
  (val) => val.map((address) => address.toLowerCase()),
)

export const multiChainTokenWhiteList: Record<MultiChainName, string[]> = mapValues(
  {
    BSC: BSC_TOKEN_WHITELIST,
    ETH: ETH_TOKEN_WHITELIST,
    KLAYTN: [],
    KLAYTN_TESTNET: [],
  },
  (val) => val.map((address) => address.toLowerCase()),
)

export const getMultiChainQueryEndPointWithStableSwap = (chainName: MultiChainNameExtend): GraphQLClient => {
  const isStableSwap = checkIsStableSwap()
  if (isStableSwap) return multiChainQueryStableClient[chainName]
  return multiChainQueryClient[chainName]
}

// FIXME: this should be per chain
export const subgraphTokenName = {
  '0x738d96Caf7096659DB4C1aFbf1E1BDFD281f388C': 'Ankr Staked MATIC',
  '0x14016E85a25aeb13065688cAFB43044C2ef86784': 'True USD Old',
}

// FIXME: this should be per chain
export const subgraphTokenSymbol = {
  '0x14016E85a25aeb13065688cAFB43044C2ef86784': 'TUSDOLD',
}

export const checkIsStableSwap = () => window.location.href.includes('stableSwap')

export const ChainLinkSupportChains = [ChainId.BSC, ChainId.BSC_TESTNET]
