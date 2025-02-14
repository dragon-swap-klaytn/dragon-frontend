import { ChainId } from '@pancakeswap/chains'

const SWAP_TOKENS_KLAYTN_DEFAULT = `/data/tokens.json`

const KLAYTN_URLS = [SWAP_TOKENS_KLAYTN_DEFAULT]

// List of official tokens list

export const UNSUPPORTED_LIST_URLS: string[] = []
export const WARNING_LIST_URLS: string[] = []

// lower index == higher priority for token import
export const DEFAULT_LIST_OF_LISTS: string[] = [
  SWAP_TOKENS_KLAYTN_DEFAULT,
  ...UNSUPPORTED_LIST_URLS, // need to load unsupported tokens as well
  ...WARNING_LIST_URLS,
]

// default lists to be 'active' aka searched across
export const DEFAULT_ACTIVE_LIST_URLS: string[] = [SWAP_TOKENS_KLAYTN_DEFAULT]

// DEV_NOTE [체인설정]_4 : token list url 설정
export const MULTI_CHAIN_LIST_URLS: { [chainId: number]: string[] } = {
  [ChainId.KLAYTN]: KLAYTN_URLS,
}
