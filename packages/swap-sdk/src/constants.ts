import { ChainId } from '@pancakeswap/chains'
import { Percent } from '@pancakeswap/swap-sdk-core'
import { Address, Hash } from 'viem'
import { ERC20Token } from './entities/token'

export const ZERO_PERCENT = new Percent('0')
export const ONE_HUNDRED_PERCENT = new Percent('1')

export const FACTORY_ADDRESS = '0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73'

// DEV_NOTE [체인설정]_7-5 : factory 설정
export const FACTORY_ADDRESS_MAP = {
  [ChainId.KLAYTN]: '0x224302153096E3ba16c4423d9Ba102D365a94B2B',
  [ChainId.KLAYTN_TESTNET]: '0xeE53E0Ad4F0dda437d79000188856aCd3F491e88',
} as const satisfies Record<ChainId, Address>

export const INIT_CODE_HASH = '0x00fb7f630766e6a796048ea87d01acd3068e8ff67d078148a3fa3f4a84f69bd5'

const INIT_CODE_HASH_KLAY = '0x1f07efc9aeaf9f1a5259be7f0e4bd52396274fcf450ef2efd01a1ac8965b12b2'

export const INIT_CODE_HASH_MAP = {
  [ChainId.KLAYTN]: INIT_CODE_HASH_KLAY,
  [ChainId.KLAYTN_TESTNET]: INIT_CODE_HASH_KLAY,
} as const satisfies Record<ChainId, Hash>

// DEV_NOTE [체인설정]_7-6 : wrapped native 설정
export const WETH9 = {
  [ChainId.KLAYTN]: new ERC20Token(
    ChainId.KLAYTN,
    '0x19Aac5f612f524B754CA7e7c41cbFa2E981A4432',
    18,
    'WKAIA',
    'Wrapped KAIA',
    'https://klaytn.foundation'
  ),
  [ChainId.KLAYTN_TESTNET]: new ERC20Token(
    ChainId.KLAYTN_TESTNET,
    '0x043c471bEe060e00A56CcD02c0Ca286808a5A436',
    18,
    'WKAIA',
    'Wrapped KAIA',
    'https://klaytn.foundation'
  ),
}

export const WNATIVE = {
  [ChainId.KLAYTN]: WETH9[ChainId.KLAYTN],
  [ChainId.KLAYTN_TESTNET]: WETH9[ChainId.KLAYTN_TESTNET],
} satisfies Record<ChainId, ERC20Token>

export const WNATIVE2 = {
  [ChainId.KLAYTN]: new ERC20Token(
    ChainId.KLAYTN,
    '0xf898c138f9c8825ceF83CA75535Ed77100497296',
    18,
    'RKLAY',
    'Reward KLAY',
    'https://klaytn.foundation'
  ),
}

const KAIA = {
  name: 'Kaia',
  symbol: 'KAIA',
  decimals: 18,
} as const

// DEV_NOTE [체인설정]_7-7 : native 설정
export const NATIVE = {
  [ChainId.KLAYTN]: KAIA,
  [ChainId.KLAYTN_TESTNET]: KAIA,
} satisfies Record<
  ChainId,
  {
    name: string
    symbol: string
    decimals: number
  }
>
