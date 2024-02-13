import { ChainId } from '@pancakeswap/chains'

export const SWAP_TOKEN_EXTENDED = 'https://tokens.pancakeswap.finance/pancakeswap-extended.json'

const COINGECKO = 'https://tokens.pancakeswap.finance/coingecko.json'
const SWAP_TOKENS_ETH_DEFAULT = 'https://tokens.pancakeswap.finance/pancakeswap-eth-default.json'
const SWAP_TOKENS_KLAYTN_DEFAULT = `/data/tokens.json`

export const SWAP_ETH_MM = 'https://tokens.pancakeswap.finance/pancakeswap-eth-mm.json'
export const SWAP_BSC_MM = 'https://tokens.pancakeswap.finance/pancakeswap-bnb-mm.json'

const COINGECKO_ETH = 'https://tokens.coingecko.com/uniswap/all.json'

const ETH_URLS = [SWAP_TOKENS_ETH_DEFAULT, SWAP_ETH_MM, COINGECKO_ETH]
const BSC_URLS = [SWAP_TOKEN_EXTENDED, COINGECKO, SWAP_BSC_MM]
const KLAYTN_URLS = [SWAP_TOKENS_KLAYTN_DEFAULT]

// List of official tokens list
export const OFFICIAL_LISTS = [SWAP_TOKEN_EXTENDED, SWAP_TOKENS_ETH_DEFAULT]

export const UNSUPPORTED_LIST_URLS: string[] = []
export const WARNING_LIST_URLS: string[] = []

// lower index == higher priority for token import
export const DEFAULT_LIST_OF_LISTS: string[] = [
  ...BSC_URLS,
  ...ETH_URLS,
  SWAP_TOKENS_KLAYTN_DEFAULT,
  ...UNSUPPORTED_LIST_URLS, // need to load unsupported tokens as well
  ...WARNING_LIST_URLS,
]

// default lists to be 'active' aka searched across
export const DEFAULT_ACTIVE_LIST_URLS: string[] = [
  SWAP_TOKEN_EXTENDED,
  SWAP_TOKENS_ETH_DEFAULT,
  SWAP_TOKENS_KLAYTN_DEFAULT,
  SWAP_ETH_MM,
  SWAP_BSC_MM,
]

// DEV_NOTE [체인설정]_4 : token list url 설정
export const MULTI_CHAIN_LIST_URLS: { [chainId: number]: string[] } = {
  [ChainId.BSC]: BSC_URLS,
  [ChainId.ETHEREUM]: ETH_URLS,
  [ChainId.KLAYTN]: KLAYTN_URLS
}
