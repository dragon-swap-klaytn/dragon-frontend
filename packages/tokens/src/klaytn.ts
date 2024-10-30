import { ChainId } from '@pancakeswap/chains'
import { ERC20Token, WETH9 } from '@pancakeswap/sdk'
import { USDT } from './common'

export const klaytnTokens = {
  weth: WETH9[ChainId.KLAYTN],
  usdt: USDT[ChainId.KLAYTN],
  btcb: new ERC20Token(8217, '0x15D9f3AB1982B0e5a415451259994Ff40369f584', 18, 'BTCB', 'BTCB Token'),
  eth: new ERC20Token(8217, '0x98A8345bB9D3DDa9D808Ca1c9142a28F6b0430E1', 18, 'WETH', 'Wrapped Ether'),
  usdc: new ERC20Token(8217, '0x608792Deb376CCE1c9FA4D0E6B7b44f507CfFa6A', 6, 'USDC', 'USD Coin'),
  fnsa: new ERC20Token(8217, '0x19a16aA7c987fBDa7dAe021B05C1EB06524C7893', 6, 'nFNSA', 'NEOPIN Klaytn FNSA'),
  sln: new ERC20Token(8217, '0x06A210EAE2b07f9dC22cDb10c2C77cA99b3d8968', 18, 'SLN', 'Smart Layer Network Token'),
  ace: new ERC20Token(8217, '0xAAecB956075dAf626Bc5d507bB38764E122CF209', 18, 'ACE', 'ACEToken'),
  kai: new ERC20Token(8217, '0xe950bdcFa4d1e45472E76cf967Db93dBfc51Ba3E', 18, 'KAI', 'Kai Token'),
  grnd: new ERC20Token(8217, '0x84F8C3C8d6eE30a559D73Ec570d574f671E82647', 18, 'GRND', 'SuperWalk'),
  mbx: new ERC20Token(8217, '0xD068c52d81f4409B9502dA926aCE3301cc41f623', 18, 'MBX', 'MarbleX'),
  six: new ERC20Token(8217, '0xEf82b1C6A550e730D8283E1eDD4977cd01FAF435', 18, 'SIX', 'SIX'),
  bora: new ERC20Token(8217, '0x02cbE46fB8A1F579254a9B485788f2D86Cad51aa', 18, 'BORA', 'BORA'),
  npt: new ERC20Token(8217, '0xE06597D02A2C3AA7a9708DE2Cfa587B128bd3815', 18, 'NPT', 'NEOPIN Token'),
  awm: new ERC20Token(8217, '0x3043988Aa54bb3ae4DA60EcB1DC643c630A564F0', 18, 'AWM', 'Another World Metaverse'),
  azit: new ERC20Token(8217, '0x6CEF6Dd9a3C4ad226b8B66EffEEa2c125dF194F1', 18, 'AZIT', 'AziT'),
  d0: new ERC20Token(8217, '0x3ac780e2c6906ab85912f4aF2a8fD390Dc7e5B06', 18, 'D_0', 'Dragon0'),
  d1: new ERC20Token(8217, '0x3DaeFf09Db758C210B980624241FB3532A32DF1F', 18, 'D_1', 'Dragon1'),
  xgrnd: new ERC20Token(8217, '0x9bcb2EFC545f89986CF70d3aDC39079a1B730D63', 18, 'xGRND', 'Staked GRND'),
  stkaia: new ERC20Token(8217, '0x42952B873ed6f7f0A7E4992E2a9818E3A9001995', 18, 'stKAIA', 'Lair Staked KAIA'),
  usdt_e: new ERC20Token(
    8217,
    '0x9025095263d1E548dc890A7589A4C78038aC40ab',
    6,
    'USDT(Stargate)',
    'Tether USD (Stargate)',
  ),
  usdc_e: new ERC20Token(
    8217,
    '0xE2053BCf56D2030d2470Fb454574237cF9ee3D4B',
    6,
    'USDC(Stargate)',
    'Bridged USDC (Stargate)',
  ),
  krwo: new ERC20Token(8217, '0x7FC692699f2216647a0E06225d8bdF8cDeE40e7F', 18, 'KRWO', 'KRWO'),
}
