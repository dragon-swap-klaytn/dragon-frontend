import { ChainId } from '@pancakeswap/chains'
import { _klaytn, _klaytnBaobab } from 'config/chains'

export const SERVER_NODES = {
  [ChainId.KLAYTN]: _klaytn.rpcUrls.public.http,
  [ChainId.KLAYTN_TESTNET]: _klaytnBaobab.rpcUrls.public.http,
} satisfies Record<ChainId, readonly string[]>

// DEV_NOTE [체인설정]_3 : rpc url 설정
export const PUBLIC_NODES = {
  [ChainId.KLAYTN]: _klaytn.rpcUrls.public.http,
  [ChainId.KLAYTN_TESTNET]: _klaytnBaobab.rpcUrls.public.http,
} satisfies Record<ChainId, readonly string[]>
