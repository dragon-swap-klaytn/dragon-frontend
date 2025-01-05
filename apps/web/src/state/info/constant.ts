import { BLOCKS_CLIENT_KLAYTN, BLOCKS_CLIENT_KLAYTN_TESTNET } from 'config/constants/endpoints'
import { GraphQLClient } from 'graphql-request'
import { v2Clients } from 'utils/graphql'

import { ChainId } from '@pancakeswap/chains'
import mapValues from 'lodash/mapValues'
import { klaytn } from 'viem/chains'

export type MultiChainName = 'KLAYTN' | 'KLAYTN_TESTNET'

export type MultiChainNameExtend = MultiChainName

export const multiChainName: Record<number | string, MultiChainNameExtend> = {
  [ChainId.KLAYTN]: 'KLAYTN',
  [ChainId.KLAYTN_TESTNET]: 'KLAYTN_TESTNET',
}

export const multiChainShortName: Record<number, string> = {}

export const multiChainQueryMainToken: Record<MultiChainName, string> = {
  KLAYTN: 'KLAYTN',
  KLAYTN_TESTNET: 'KLAYTN_TESTNET',
}

export const multiChainBlocksClient: Record<MultiChainNameExtend, string> = {
  KLAYTN: BLOCKS_CLIENT_KLAYTN,
  KLAYTN_TESTNET: BLOCKS_CLIENT_KLAYTN_TESTNET,
}

export const multiChainStartTime = {
  KLAYTN: 145315220,
  KLAYTN_TESTNET: 144998615,
}

export const multiChainId: Record<MultiChainName, ChainId> = {
  KLAYTN: ChainId.KLAYTN,
  KLAYTN_TESTNET: ChainId.KLAYTN_TESTNET,
}

export const multiChainPaths = {
  [ChainId.KLAYTN]: '/klaytn',
}

export const multiChainQueryClient = {
  KLAYTN: v2Clients[ChainId.KLAYTN],
  KLAYTN_TESTNET: v2Clients[ChainId.KLAYTN_TESTNET],
}

export const multiChainQueryStableClient = {
  KLAYTN: v2Clients[ChainId.KLAYTN],
  KLAYTN_TESTNET: v2Clients[ChainId.KLAYTN_TESTNET],
}

export const STABLESWAP_SUBGRAPHS_START_BLOCK = {}

export const multiChainScan: Record<MultiChainName, string> = {
  KLAYTN: klaytn.blockExplorers.etherscan.name,
  KLAYTN_TESTNET: 'KlaytnScope',
}

export const multiChainTokenBlackList: Record<MultiChainName, string[]> = mapValues(
  {
    KLAYTN: [] as string[],
    KLAYTN_TESTNET: [] as string[],
  },
  (val) => val.map((address) => address.toLowerCase()),
)

export const multiChainTokenWhiteList: Record<MultiChainName, string[]> = mapValues(
  {
    KLAYTN: [] as string[],
    KLAYTN_TESTNET: [] as string[],
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

export const ChainLinkSupportChains = [] as number[]
