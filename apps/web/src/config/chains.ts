import { ChainId, chainNames } from '@pancakeswap/chains'
import memoize from 'lodash/memoize'
import { klaytn, klaytnBaobab } from 'wagmi/chains'

export const CHAIN_QUERY_NAME = chainNames

const CHAIN_QUERY_NAME_TO_ID = Object.entries(CHAIN_QUERY_NAME).reduce((acc, [chainId, chainName]) => {
  return {
    [chainName.toLowerCase()]: chainId as unknown as ChainId,
    ...acc,
  }
}, {} as Record<string, ChainId>)

export const getChainId = memoize((chainName: string) => {
  if (!chainName) return undefined
  return CHAIN_QUERY_NAME_TO_ID[chainName.toLowerCase()] ? +CHAIN_QUERY_NAME_TO_ID[chainName.toLowerCase()] : undefined
})

const _klaytnRpc = [
  'https://public-en.node.kaia.io',
  'https://alpha-hardworking-orb.kaia-mainnet.quiknode.pro/',
  'https://kaia.blockpi.network/v1/rpc/public',
  'https://klaytn.api.onfinality.io/public',
  'https://kaia-mainnet.rpc.grove.city/v1/803ceedf',
  'https://go.getblock.io/d7094dbd80ab474ba7042603fe912332',
]
export const _klaytn = {
  ...klaytn,
  rpcUrls: {
    public: {
      http: _klaytnRpc,
    },
    default: {
      http: _klaytnRpc,
    },
  },
}

const _klaytnBaobabRPC = [
  'https://public-en-kairos.node.kaia.io',
  'https://responsive-green-emerald.kaia-kairos.quiknode.pro/',
  'https://kaia-kairos.blockpi.network/v1/rpc/public',
]
export const _klaytnBaobab = {
  ...klaytnBaobab,
  rpcUrls: {
    public: {
      http: _klaytnBaobabRPC,
    },
    default: {
      http: _klaytnBaobabRPC,
    },
  },
}

/**
 * Controls some L2 specific behavior, e.g. slippage tolerance, special UI behavior.
 * The expectation is that all of these networks have immediate transaction confirmation.
 */
export const L2_CHAIN_IDS: ChainId[] = []

// DEV_NOTE [체인설정]_2 : 목록 설정
export const CHAINS = process.env.NEXT_PUBLIC_ENV === 'dev' ? [_klaytn, _klaytnBaobab] : [_klaytn]
