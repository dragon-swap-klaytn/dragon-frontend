import { klaytnTokens } from '@pancakeswap/tokens'
import { FeeAmount } from '@pancakeswap/v3-sdk'
import { SerializedFarmConfig } from '../src'
import { defineFarmV3Configs } from '../src/defineFarmV3Configs'

export const farmsV3 = defineFarmV3Configs([
  {
    pid: 1,
    lpAddress: '0xb64BA987eD3BD9808dBCc19EE3C2A3C79A977E66',
    token0: klaytnTokens.weth,
    token1: klaytnTokens.usdt,
    feeAmount: FeeAmount.LOW,
  },
  {
    pid: 2,
    lpAddress: '0x310EC7e68554492a6830F030aFd72A112c4d261d',
    token0: klaytnTokens.btcb,
    token1: klaytnTokens.eth,
    feeAmount: FeeAmount.MEDIUMLOW,
  },
  {
    pid: 3,
    lpAddress: '0xAb9270593dBc94b13F76C960496865Dd87C06489',
    token0: klaytnTokens.usdt,
    token1: klaytnTokens.eth,
    feeAmount: FeeAmount.MEDIUMLOW,
  },
  {
    pid: 4,
    lpAddress: '0xD79539fd47089Ad468A990e5075c8e1c5D724bfA',
    token0: klaytnTokens.btcb,
    token1: klaytnTokens.usdt,
    feeAmount: FeeAmount.MEDIUMLOW,
  },
  {
    pid: 5,
    lpAddress: '0x2D30DA704c03F11de0255543476ACc9E1322a1F5',
    token0: klaytnTokens.usdt,
    token1: klaytnTokens.usdc,
    feeAmount: FeeAmount.LOW,
  },
  {
    pid: 6,
    lpAddress: '0xd8f6Db387B869a03Df1530b71A896F82EA9B7488',
    token0: klaytnTokens.fnsa,
    token1: klaytnTokens.weth,
    feeAmount: FeeAmount.HIGH,
  },
  {
    pid: 7,
    lpAddress: '0x5210d209ba80cE043Eb3fbf934Ca8ea5CE9018F4',
    token0: klaytnTokens.sln,
    token1: klaytnTokens.usdt,
    feeAmount: FeeAmount.MEDIUM,
  },
  {
    pid: 8,
    lpAddress: '0xD7BDafe82E80374550CD4a8ad94EA867CCD16062',
    token0: klaytnTokens.usdt,
    token1: klaytnTokens.ace,
    feeAmount: FeeAmount.MEDIUM,
  },
  {
    pid: 10,
    lpAddress: '0x9f9ff6d0b47C652ab2512771fB18781E29712c45',
    token0: klaytnTokens.usdt,
    token1: klaytnTokens.grnd,
    feeAmount: FeeAmount.MEDIUM,
  },
  {
    pid: 9,
    lpAddress: '0xc0098324e43A48987972cfdF5B9Edd1bF04C1435',
    token0: klaytnTokens.usdt,
    token1: klaytnTokens.kai,
    feeAmount: FeeAmount.MEDIUM,
  },
  {
    pid: 11,
    lpAddress: '0x1Bf999A15257a68f32e4aEf39a595a214c9bA0a0',
    token0: klaytnTokens.weth,
    token1: klaytnTokens.grnd,
    feeAmount: FeeAmount.MEDIUM,
  },
  {
    pid: 12,
    lpAddress: '0xD90028cd925a310ba7471991e36F0D6499D7B864',
    token0: klaytnTokens.weth,
    token1: klaytnTokens.mbx,
    feeAmount: FeeAmount.MEDIUM,
  },
  {
    pid: 13,
    lpAddress: '0xdc49e7EF3794275927CaD7328235e581071B0378',
    token0: klaytnTokens.weth,
    token1: klaytnTokens.six,
    feeAmount: FeeAmount.MEDIUM,
  },
  {
    pid: 14,
    lpAddress: '0x3288Aa19acdAaC957DAe670392B9568E39b686CD',
    token0: klaytnTokens.bora,
    token1: klaytnTokens.weth,
    feeAmount: FeeAmount.MEDIUM,
  },
  {
    pid: 15,
    lpAddress: '0x00374284DD66F75134e51fAb9E522DC322431c48',
    token0: klaytnTokens.weth,
    token1: klaytnTokens.awm,
    feeAmount: FeeAmount.MEDIUM,
  },
  // {
  //   pid: 15,
  //   lpAddress: '0x53Bd96856487CBB0543293488792675c212Aa4f0',
  //   token0: klaytnTokens.weth,
  //   token1: klaytnTokens.npt,
  //   feeAmount: FeeAmount.MEDIUM,
  // },
  {
    pid: 16,
    lpAddress: '0xb39A385dba6aB12B09391F9a30ea927EAa4754Ef',
    token0: klaytnTokens.d1,
    token1: klaytnTokens.d0,
    feeAmount: FeeAmount.LOWEST,
  },
  {
    pid: 17,
    lpAddress: '0xcC8336d19953F687A4A0fb4D6ca1053227e69a3e',
    token0: klaytnTokens.weth,
    token1: klaytnTokens.azit,
    feeAmount: FeeAmount.MEDIUM,
  },
  {
    pid: 18,
    lpAddress: '0xFb6B00F575693079bF43e38C61354a88E6F30d57',
    token0: klaytnTokens.bora,
    token1: klaytnTokens.usdt,
    feeAmount: FeeAmount.MEDIUM,
  },
])

export const farmsV3Finished = defineFarmV3Configs([
  {
    pid: 1,
    lpAddress: '0xb64BA987eD3BD9808dBCc19EE3C2A3C79A977E66',
    token0: klaytnTokens.weth,
    token1: klaytnTokens.usdt,
    feeAmount: FeeAmount.LOW,
  },
  {
    pid: 2,
    lpAddress: '0x310EC7e68554492a6830F030aFd72A112c4d261d',
    token0: klaytnTokens.btcb,
    token1: klaytnTokens.eth,
    feeAmount: FeeAmount.MEDIUMLOW,
  },
  {
    pid: 3,
    lpAddress: '0xAb9270593dBc94b13F76C960496865Dd87C06489',
    token0: klaytnTokens.usdt,
    token1: klaytnTokens.eth,
    feeAmount: FeeAmount.MEDIUMLOW,
  },
  {
    pid: 4,
    lpAddress: '0xD79539fd47089Ad468A990e5075c8e1c5D724bfA',
    token0: klaytnTokens.btcb,
    token1: klaytnTokens.usdt,
    feeAmount: FeeAmount.MEDIUMLOW,
  },
  {
    pid: 5,
    lpAddress: '0x2D30DA704c03F11de0255543476ACc9E1322a1F5',
    token0: klaytnTokens.usdt,
    token1: klaytnTokens.usdc,
    feeAmount: FeeAmount.LOW,
  },
  {
    pid: 6,
    lpAddress: '0xd8f6Db387B869a03Df1530b71A896F82EA9B7488',
    token0: klaytnTokens.fnsa,
    token1: klaytnTokens.weth,
    feeAmount: FeeAmount.HIGH,
  },
  {
    pid: 7,
    lpAddress: '0x5210d209ba80cE043Eb3fbf934Ca8ea5CE9018F4',
    token0: klaytnTokens.sln,
    token1: klaytnTokens.usdt,
    feeAmount: FeeAmount.MEDIUM,
  },
])

const farmsV2: SerializedFarmConfig[] = []

export default farmsV2
