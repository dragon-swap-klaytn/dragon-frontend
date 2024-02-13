import { defineFarmV3Configs } from '../src/defineFarmV3Configs'
import { ERC20Token } from '@pancakeswap/sdk'
import { FeeAmount } from '@pancakeswap/v3-sdk'
import { ChainId } from '@pancakeswap/chains'
import { SerializedFarmConfig } from '..'

const testTokens = [
  new ERC20Token(
    ChainId.KLAYTN_TESTNET,
    '0xedb250ee8163ac4cc2be7b1b8d16e4a2bf51eca8',
    18,
    'PAN1',
    'PAN1',
    '',
  ),
  new ERC20Token(
    ChainId.KLAYTN_TESTNET,
    '0x53412515689b6de2d6fb9a51c14b57c12bd268e0',
    18,
    'PAN2',
    'PAN2',
    '',
  )
]

export const farmsV3 = defineFarmV3Configs([
  {
    pid: 1,
    lpAddress: '0xcc080051899032b92bffe806c1dd287d71ec8916',
    token0: testTokens[1],
    token1: testTokens[0],
    feeAmount: FeeAmount.MEDIUM,
  },
  {
    pid: 2,
    lpAddress: '0x98771A93486003DC2070cB8d56402CB45f1a0C5F',
    token0: testTokens[1],
    token1: testTokens[0],
    feeAmount: FeeAmount.LOWEST,
  },
])

const farmsV2: SerializedFarmConfig[] = [
  {
    pid: 0,
    lpSymbol: 'PAN2-PAN1 LP',
    lpAddress: '0x60f5cbF94377647249429B171076Df61F51eF3F4',
    quoteToken: testTokens[1].serialize,
    token: testTokens[0].serialize,
  },
  {
    pid: 1,
    lpSymbol: 'KLAY-PAN1 LP',
    lpAddress: '0xC483aE3AE434705E5172ec4EE9959792f128C5A2',
    quoteToken: new ERC20Token(
      ChainId.KLAYTN_TESTNET,
      '0x043c471bEe060e00A56CcD02c0Ca286808a5A436',
      18,
      'WKLAY',
      'Wrapped KLAY',
    ).serialize,
    token: testTokens[0].serialize,
  }
]

export default farmsV2