import { ChainId, chainNames } from '@pancakeswap/chains'
import memoize from 'lodash/memoize'
import { Chain, bsc as bsc_, klaytn, klaytnBaobab } from 'wagmi/chains'

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

const bsc = {
  ...bsc_,
  rpcUrls: {
    ...bsc_.rpcUrls,
    public: {
      ...bsc_.rpcUrls.public,
      http: ['https://bsc-dataseed.binance.org/'],
    },
    default: {
      ...bsc_.rpcUrls.default,
      http: ['https://bsc-dataseed.binance.org/'],
    },
  },
} satisfies Chain

const _klaytnRpc = [
  'https://public-en.node.kaia.io',
  'https://klaytn-mainnet-rpc.allthatnode.com:8551',
  'https://kaia.blockpi.network/v1/rpc/public	',
  'https://klaytn-rpc.gateway.pokt.network',
  'https://klaytn.drpc.org',
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
  'https://api.baobab.klaytn.net:8651',
  'https://rpc.ankr.com/klaytn_testnet',
  'https://kaia-kairos.blockpi.network/v1/rpc/public',
  'https://klaytn-baobab.blockpi.network/v1/rpc/public',
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
