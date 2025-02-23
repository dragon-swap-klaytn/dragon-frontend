import { ChainId } from '@pancakeswap/chains'
import { Address } from 'viem'

// DEV_NOTE [체인설정]_7-2 : multicall 주소 설정
export const MULTICALL_ADDRESS: { [key in ChainId]?: Address } = {
  [ChainId.KLAYTN]: '0xCFA1710d22f5d6FDC06a9Ec37cC362eAD041A4E9',

  // Testnets
  [ChainId.KLAYTN_TESTNET]: '0x46E0392c01D2F42fd6bEe248dFB3072Cc9920D24',
}

export const MULTICALL3_ADDRESS = '0xcA11bde05977b3631167028862bE2a173976CA11'

export const MULTICALL3_ADDRESSES: {
  [key in ChainId]?: Address
} = {
  [ChainId.KLAYTN]: MULTICALL3_ADDRESS,
  [ChainId.KLAYTN_TESTNET]: MULTICALL3_ADDRESS,
}
