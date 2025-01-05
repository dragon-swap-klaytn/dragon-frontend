import { ChainId } from '@pancakeswap/chains'

export const nativeStableLpMap = {
  [ChainId.KLAYTN]: {
    address: '0xb64BA987eD3BD9808dBCc19EE3C2A3C79A977E66',
    wNative: 'WKLAY',
    stable: 'USDT',
  },
  [ChainId.KLAYTN_TESTNET]: {
    address: '0x',
    wNative: 'WKLAY',
    stable: 'oUSDT',
  },
}
