import { Percent } from '@pancakeswap/swap-sdk-core'
import { ChainId } from '@pancakeswap/chains'
import { Address, Hash } from 'viem'
import { ERC20Token } from './entities/token'

export const ZERO_PERCENT = new Percent('0')
export const ONE_HUNDRED_PERCENT = new Percent('1')

export const FACTORY_ADDRESS = '0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73'

const FACTORY_ADDRESS_ETH = '0x1097053Fd2ea711dad45caCcc45EfF7548fCB362'

// DEV_NOTE [체인설정]_7-5 : factory 설정
export const FACTORY_ADDRESS_MAP = {
  [ChainId.ETHEREUM]: FACTORY_ADDRESS_ETH,
  [ChainId.GOERLI]: FACTORY_ADDRESS_ETH,
  [ChainId.BSC]: FACTORY_ADDRESS,
  [ChainId.BSC_TESTNET]: '0x6725F303b657a9451d8BA641348b6761A6CC7a17',
  [ChainId.KLAYTN]: '0x224302153096E3ba16c4423d9Ba102D365a94B2B',
  [ChainId.KLAYTN_TESTNET]: '0xeE53E0Ad4F0dda437d79000188856aCd3F491e88',
} as const satisfies Record<ChainId, Address>

export const INIT_CODE_HASH = '0x00fb7f630766e6a796048ea87d01acd3068e8ff67d078148a3fa3f4a84f69bd5'

const INIT_CODE_HASH_ETH = '0x57224589c67f3f30a6b0d7a1b54cf3153ab84563bc609ef41dfb34f8b2974d2d'
const INIT_CODE_HASH_KLAY = '0x1f07efc9aeaf9f1a5259be7f0e4bd52396274fcf450ef2efd01a1ac8965b12b2'

export const INIT_CODE_HASH_MAP = {
  [ChainId.ETHEREUM]: INIT_CODE_HASH_ETH,
  [ChainId.GOERLI]: INIT_CODE_HASH_ETH,
  [ChainId.BSC]: INIT_CODE_HASH,
  [ChainId.BSC_TESTNET]: '0xd0d4c4cd0848c93cb4fd1f498d7013ee6bfb25783ea21593d5834f5d250ece66',
  [ChainId.KLAYTN]: INIT_CODE_HASH_KLAY,
  [ChainId.KLAYTN_TESTNET]: INIT_CODE_HASH_KLAY,
} as const satisfies Record<ChainId, Hash>

// DEV_NOTE [체인설정]_7-6 : wrapped native 설정
export const WETH9 = {
  [ChainId.ETHEREUM]: new ERC20Token(
    ChainId.ETHEREUM,
    '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    18,
    'WETH',
    'Wrapped Ether',
    'https://weth.io'
  ),
  [ChainId.GOERLI]: new ERC20Token(
    ChainId.GOERLI,
    '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6',
    18,
    'WETH',
    'Wrapped Ether',
    'https://weth.io'
  ),
  [ChainId.BSC]: new ERC20Token(
    ChainId.BSC,
    '0x2170Ed0880ac9A755fd29B2688956BD959F933F8',
    18,
    'ETH',
    'Binance-Peg Ethereum Token',
    'https://ethereum.org'
  ),
  [ChainId.BSC_TESTNET]: new ERC20Token(
    ChainId.BSC,
    '0xE7bCB9e341D546b66a46298f4893f5650a56e99E',
    18,
    'ETH',
    'ETH',
    'https://ethereum.org'
  ),
  [ChainId.KLAYTN]: new ERC20Token(
    ChainId.KLAYTN,
    '0x19Aac5f612f524B754CA7e7c41cbFa2E981A4432',
    18,
    'WKLAY',
    'Wrapped Klay',
    'https://klaytn.foundation'
  ),
  [ChainId.KLAYTN_TESTNET]: new ERC20Token(
    ChainId.KLAYTN_TESTNET,
    '0x043c471bEe060e00A56CcD02c0Ca286808a5A436',
    18,
    'WKLAY',
    'Wrapped KLAY',
    'https://klaytn.foundation'
  ),
}

export const WBNB = {
  [ChainId.ETHEREUM]: new ERC20Token(
    ChainId.ETHEREUM,
    '0x418D75f65a02b3D53B2418FB8E1fe493759c7605',
    18,
    'WBNB',
    'Wrapped BNB',
    'https://www.binance.org'
  ),
  [ChainId.BSC]: new ERC20Token(
    ChainId.BSC,
    '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
    18,
    'WBNB',
    'Wrapped BNB',
    'https://www.binance.org'
  ),
  [ChainId.BSC_TESTNET]: new ERC20Token(
    ChainId.BSC_TESTNET,
    '0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd',
    18,
    'WBNB',
    'Wrapped BNB',
    'https://www.binance.org'
  ),
}

export const WNATIVE = {
  [ChainId.ETHEREUM]: WETH9[ChainId.ETHEREUM],
  [ChainId.GOERLI]: WETH9[ChainId.GOERLI],
  [ChainId.BSC]: WBNB[ChainId.BSC],
  [ChainId.BSC_TESTNET]: WBNB[ChainId.BSC_TESTNET],
  [ChainId.KLAYTN]: WETH9[ChainId.KLAYTN],
  [ChainId.KLAYTN_TESTNET]: WETH9[ChainId.KLAYTN_TESTNET],
} satisfies Record<ChainId, ERC20Token>

const ETHER = { name: 'Ether', symbol: 'ETH', decimals: 18 } as const
const BNB = {
  name: 'Binance Chain Native Token',
  symbol: 'BNB',
  decimals: 18,
} as const
const KLAY = {
  name: 'Klay',
  symbol: 'KLAY',
  decimals: 18,
} as const

// DEV_NOTE [체인설정]_7-7 : native 설정
export const NATIVE = {
  [ChainId.ETHEREUM]: ETHER,
  [ChainId.GOERLI]: { name: 'Goerli Ether', symbol: 'GOR', decimals: 18 },
  [ChainId.BSC]: BNB,
  [ChainId.BSC_TESTNET]: {
    name: 'Binance Chain Native Token',
    symbol: 'tBNB',
    decimals: 18,
  },
  [ChainId.KLAYTN]: KLAY,
  [ChainId.KLAYTN_TESTNET]: KLAY,
} satisfies Record<
  ChainId,
  {
    name: string
    symbol: string
    decimals: number
  }
>
