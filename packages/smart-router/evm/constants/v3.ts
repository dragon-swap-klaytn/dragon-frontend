import { ChainId } from '@pancakeswap/chains'
import { Address } from 'viem'

// = 1 << 23 or 100000000000000000000000
export const V2_FEE_PATH_PLACEHOLDER = 8388608

export const MSG_SENDER = '0x0000000000000000000000000000000000000001'
export const ADDRESS_THIS = '0x0000000000000000000000000000000000000002'

// DEV_NOTE [체인설정]_7-4 : quoter address 설정
export const MIXED_ROUTE_QUOTER_ADDRESSES = {
  [ChainId.KLAYTN]: '0xa36aAf0Ae4E2a91B0ebf0bFE938AD3F55f8D4Ee4',
  [ChainId.KLAYTN_TESTNET]: '0x8A8af0b907914AaB7029D408307f573B80eB1a6a',
} as const satisfies Record<ChainId, Address>

export const V3_QUOTER_ADDRESSES = {
  [ChainId.KLAYTN]: '0x673d88960D320909af24db6eE7665aF223fec060',
  [ChainId.KLAYTN_TESTNET]: '0x8b58Cba059a332E971c6Ca79dcE9f7f42Ca49be4',
} as const satisfies Record<ChainId, Address>
