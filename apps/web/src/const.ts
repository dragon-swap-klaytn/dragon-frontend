import { ChainId } from '@pancakeswap/chains'
import { Token } from '@pancakeswap/swap-sdk-core'
import { TETHER_ADDRESS, TETHER_DECIMALS, TETHER_NAME, TETHER_SYMBOL, WKAIA_ADDRESS } from '@pancakeswap/uikit'
import { PoolType } from 'types'
import { Address } from 'viem'
import { poolTypeSelectorOptions } from 'views/PoolsV2/components/PoolTypeSelector'

export const DEFAULT_TOKEN_LIST = [
  {
    chainId: ChainId.KLAYTN,
    address: WKAIA_ADDRESS.toLowerCase(),
    decimals: 18,
    symbol: 'WKAIA',
    name: 'Wrapped KAIA',
  },
  {
    chainId: ChainId.KLAYTN,
    address: '0x98A8345bB9D3DDa9D808Ca1c9142a28F6b0430E1'.toLowerCase(),
    name: 'Wrapped Ether',
    symbol: 'WETH',
    decimals: 18,
  },
  {
    chainId: ChainId.KLAYTN,
    address: '0x98A8345bB9D3DDa9D808Ca1c9142a28F6b0430E1'.toLowerCase(),
    name: 'Wrapped Ether',
    symbol: 'WETH',
    decimals: 18,
  },
  {
    chainId: ChainId.KLAYTN,
    address: '0x5C13E303a62Fc5DEdf5B52D66873f2E59fEdADC2'.toLowerCase(),
    name: 'Tether USD',
    symbol: 'USDT',
    decimals: 6,
  },
  {
    chainId: ChainId.KLAYTN,
    address: '0x608792Deb376CCE1c9FA4D0E6B7b44f507CfFa6A'.toLowerCase(),
    name: 'USD Coin',
    symbol: 'USDC',
    decimals: 6,
  },
  {
    chainId: ChainId.KLAYTN,
    address: '0xCB2C7998696Ef7a582dFD0aAFadCd008D03E791A'.toLowerCase(),
    name: 'Dai Stablecoin',
    symbol: 'DAI',
    decimals: 18,
  },
  {
    chainId: ChainId.KLAYTN,
    address: '0x15D9f3AB1982B0e5a415451259994Ff40369f584'.toLowerCase(),
    name: 'BTCB Token',
    symbol: 'BTCB',
    decimals: 18,
  },
  {
    chainId: ChainId.KLAYTN,
    address: '0xaC9C1E4787139aF4c751B1C0fadfb513C44Ed833'.toLowerCase(),
    name: 'Wrapped BNB',
    symbol: 'WBNB',
    decimals: 18,
  },
  {
    chainId: ChainId.KLAYTN,
    address: '0xfAA03A2AC2d1B8481Ec3fF44A0152eA818340e6d'.toLowerCase(),
    name: 'Wrapped SOL',
    symbol: 'SOL',
    decimals: 9,
  },
  {
    chainId: ChainId.KLAYTN,
    address: '0x45830b92443a8f750247da2A76C85c70d0f1EBF3'.toLowerCase(),
    name: 'Wrapped AVAX',
    symbol: 'WAVAX',
    decimals: 18,
  },
  {
    chainId: ChainId.KLAYTN,
    address: '0x02cbE46fB8A1F579254a9B485788f2D86Cad51aa'.toLowerCase(),
    name: 'BORA',
    symbol: 'BORA',
    decimals: 18,
  },
  {
    chainId: ChainId.KLAYTN,
    address: '0xD068c52d81f4409B9502dA926aCE3301cc41f623'.toLowerCase(),
    name: 'MarbleX',
    symbol: 'MBX',
    decimals: 18,
  },
  {
    chainId: ChainId.KLAYTN,
    address: '0x84F8C3C8d6eE30a559D73Ec570d574f671E82647'.toLowerCase(),
    name: 'SuperWalk',
    symbol: 'GRND',
    decimals: 18,
  },
  {
    chainId: ChainId.KLAYTN,
    address: '0x19a16aA7c987fBDa7dAe021B05C1EB06524C7893'.toLowerCase(),
    name: 'NEOPIN Klaytn FNSA',
    symbol: 'nFNSA',
    decimals: 6,
  },
  {
    chainId: ChainId.KLAYTN,
    address: '0xf898c138f9c8825ceF83CA75535Ed77100497296'.toLowerCase(),
    name: 'Reward KAIA',
    symbol: 'RKAIA',
    decimals: 18,
  },
  {
    chainId: ChainId.KLAYTN,
    address: '0x06A210EAE2b07f9dC22cDb10c2C77cA99b3d8968'.toLowerCase(),
    name: 'Smart Layer Network Token',
    symbol: 'SLN',
    decimals: 18,
  },
  {
    chainId: ChainId.KLAYTN,
    address: '0xAAecB956075dAf626Bc5d507bB38764E122CF209'.toLowerCase(),
    name: 'ACEToken',
    symbol: 'ACE',
    decimals: 18,
  },
  {
    chainId: ChainId.KLAYTN,
    address: '0x5166FA1AcbA89E5e0DE27841a1110B7f9aC112Da'.toLowerCase(),
    name: 'Nox',
    symbol: 'NOX',
    decimals: 18,
  },
  {
    chainId: ChainId.KLAYTN,
    address: '0xe950bdcFa4d1e45472E76cf967Db93dBfc51Ba3E'.toLowerCase(),
    name: 'Kai Token',
    symbol: 'KAI',
    decimals: 18,
  },
  {
    chainId: ChainId.KLAYTN,
    address: '0xE06597D02A2C3AA7a9708DE2Cfa587B128bd3815'.toLowerCase(),
    name: 'NEOPIN Token',
    symbol: 'NPT',
    decimals: 18,
  },
  {
    chainId: ChainId.KLAYTN,
    address: '0xEf82b1C6A550e730D8283E1eDD4977cd01FAF435'.toLowerCase(),
    name: 'SIX',
    symbol: 'SIX',
    decimals: 18,
  },
  {
    chainId: ChainId.KLAYTN,
    address: '0x3043988Aa54bb3ae4DA60EcB1DC643c630A564F0'.toLowerCase(),
    name: 'Another World Metaverse',
    symbol: 'AWM',
    decimals: 18,
  },
  {
    chainId: ChainId.KLAYTN,
    address: '0xe3F85b41A284eD965826Adc98365E70E67A2f556'.toLowerCase(),
    name: 'Kkakdugi',
    symbol: 'KKAK',
    decimals: 18,
  },
  {
    chainId: ChainId.KLAYTN,
    address: '0x6CEF6Dd9a3C4ad226b8B66EffEEa2c125dF194F1'.toLowerCase(),
    name: 'AziT',
    symbol: 'AZIT',
    decimals: 18,
  },
  {
    chainId: ChainId.KLAYTN,
    address: '0xeE63BCd19DdD847B6Cf0812e80838069897045dB'.toLowerCase(),
    name: 'Silicon Stable',
    symbol: 'SI',
    decimals: 18,
  },
  {
    chainId: ChainId.KLAYTN,
    address: '0xaC6107f970157eC27f95cF35D6d1141fe1A56e79'.toLowerCase(),
    name: 'Silicon ETH',
    symbol: 'SI-E',
    decimals: 18,
  },
  {
    chainId: ChainId.KLAYTN,
    address: '0x282f5B73c0A936E75C5C8E044A5241D4208B89C7'.toLowerCase(),
    name: 'Silicon BTC',
    symbol: 'SI-B',
    decimals: 18,
  },
  {
    chainId: ChainId.KLAYTN,
    address: '0x0f58d0AbAae2F586b0D3b6D045305463e89ba603'.toLowerCase(),
    name: 'KKUL THE PARROT',
    symbol: 'KKULP',
    decimals: 18,
  },
  {
    chainId: ChainId.KLAYTN,
    address: '0xfBA4969E48EF38E189579F6bd0a7b6469F055564'.toLowerCase(),
    name: 'Mudol2 Token',
    symbol: 'MUDOL2',
    decimals: 18,
  },
  {
    chainId: ChainId.KLAYTN,
    address: '0x7eeE60a000986E9efE7F5C90340738558c24317B'.toLowerCase(),
    name: 'PER Project',
    symbol: 'PER',
    decimals: 18,
  },
  {
    chainId: ChainId.KLAYTN,
    address: '0x1afa932f90BF84cCe04116d3370165aCD7257cc5'.toLowerCase(),
    name: 'KkakDog',
    symbol: 'KKAKDOG',
    decimals: 18,
  },
  {
    chainId: ChainId.KLAYTN,
    address: '0x9bcb2EFC545f89986CF70d3aDC39079a1B730D63'.toLowerCase(),
    name: 'Staked GRND',
    symbol: 'xGRND',
    decimals: 18,
  },
  {
    chainId: ChainId.KLAYTN,
    address: '0x230c2b527364e923ba896E1201f86F683EE3523C'.toLowerCase(),
    name: 'TOT',
    symbol: 'TOT',
    decimals: 6,
  },
  {
    chainId: ChainId.KLAYTN,
    address: '0x608E8512d31cAE43Cd8058D81E6B56203A112539'.toLowerCase(),
    name: 'BirdsPing',
    symbol: 'PING',
    decimals: 18,
  },
  {
    chainId: ChainId.KLAYTN,
    address: '0x7FC692699f2216647a0E06225d8bdF8cDeE40e7F'.toLowerCase(),
    name: 'KRWO',
    symbol: 'KRWO',
    decimals: 6,
  },
  {
    chainId: ChainId.KLAYTN,
    address: '0xB242cb981952C183421E4aC9B0D4861c27D9Dc73'.toLowerCase(),
    name: 'DrumPing',
    symbol: 'DPING',
    decimals: 18,
  },
  {
    chainId: ChainId.KLAYTN,
    address: '0x4Cad05F5AfDD4bfC072E356e88B05C33316bb1c5'.toLowerCase(),
    name: 'SeryukPing',
    symbol: 'KPING',
    decimals: 18,
  },
  {
    chainId: ChainId.KLAYTN,
    address: '0x8882ec400E9348ff60Ae85d3D90A93cF97Ce8869'.toLowerCase(),
    name: 'MultaPing',
    symbol: 'MPING',
    decimals: 18,
  },
  {
    chainId: ChainId.KLAYTN,
    address: '0x42952B873ed6f7f0A7E4992E2a9818E3A9001995'.toLowerCase(),
    name: 'Lair Staked KAIA',
    symbol: 'stKAIA',
    decimals: 18,
  },
  {
    chainId: ChainId.KLAYTN,
    address: '0xbb849b91A801aD2A24934734274E504056C5E593'.toLowerCase(),
    name: 'KkakDuck',
    symbol: 'KKAKDUCK',
    decimals: 18,
  },
  {
    chainId: ChainId.KLAYTN,
    address: '0x0f9D34Aafe97717E4C599c226444ba1e5846A85d'.toLowerCase(),
    name: 'BUG',
    symbol: 'BUG',
    decimals: 18,
  },
  {
    chainId: ChainId.KLAYTN,
    address: '0xeDCad4bd04F59E8fCC7c5fC7547e5112AE9923df'.toLowerCase(),
    name: 'Moo Deng',
    symbol: 'MOODENG',
    decimals: 18,
  },
  {
    chainId: ChainId.KLAYTN,
    address: '0x05D53Baaf5865f1df4c4f9C83CBb43664937Ef14'.toLowerCase(),
    name: 'DogPing',
    symbol: 'GPING',
    decimals: 18,
  },
  {
    chainId: ChainId.KLAYTN,
    address: '0x360580a1E1d7e8f851aeF9F2485Fe632896D504b'.toLowerCase(),
    name: 'Temu Bitcoin',
    symbol: 'TemuBTC',
    decimals: 18,
  },
  {
    chainId: ChainId.KLAYTN,
    address: '0x15fd69b5803af081e0A76a7DfD076c7Ea04F6971'.toLowerCase(),
    name: 'KaiaBunny',
    symbol: 'BUNNY',
    decimals: 18,
  },
  {
    chainId: ChainId.KLAYTN,
    address: '0x717245aac4a97B7a94d56Bbf43544bed713c29Fb'.toLowerCase(),
    name: 'Snail Kaia',
    symbol: 'SK',
    decimals: 18,
  },
  {
    chainId: ChainId.KLAYTN,
    address: '0x2591E560e62ad330dd87DC9ab7b3b799072535AD'.toLowerCase(),
    name: 'SEX',
    symbol: 'SEX',
    decimals: 18,
  },
  {
    chainId: ChainId.KLAYTN,
    address: '0xd4627dBF2C6EAEbBA0519b358E9E8Cfd5b15d7c7'.toLowerCase(),
    name: 'Genesis Ryan',
    symbol: 'RYAN',
    decimals: 18,
  },
  {
    chainId: ChainId.KLAYTN,
    address: '0x1E60E2908BA0F5a849194C28e2edC6DdA18f9Dc5'.toLowerCase(),
    name: 'ANGLE',
    symbol: 'ANGLE',
    decimals: 18,
  },
  {
    chainId: ChainId.KLAYTN,
    address: '0x9025095263d1E548dc890A7589A4C78038aC40ab'.toLowerCase(),
    name: 'Tether USD (Stargate)',
    symbol: 'USDT stargate',
    decimals: 6,
  },
  {
    chainId: ChainId.KLAYTN,
    address: '0xE2053BCf56D2030d2470Fb454574237cF9ee3D4B'.toLowerCase(),
    name: 'Bridged USDC (Stargate)',
    symbol: 'USDC stargate',
    decimals: 6,
  },
  {
    chainId: ChainId.KLAYTN,
    address: '0x4159df9507Ed52d20Ae7fD652A955d16140f2d2a'.toLowerCase(),
    name: 'KAWAII KAIA',
    symbol: 'KAWAII',
    decimals: 18,
  },
  {
    chainId: ChainId.KLAYTN,
    address: '0x97D829a2a0B1A57760E0EFa5Da23F38B2918Ac20'.toLowerCase(),
    name: 'Shin',
    symbol: 'Shin',
    decimals: 18,
  },
  {
    chainId: ChainId.KLAYTN,
    address: TETHER_ADDRESS.toLowerCase(),
    name: TETHER_NAME,
    symbol: TETHER_SYMBOL,
    decimals: TETHER_DECIMALS,
  },
  {
    chainId: ChainId.KLAYTN,
    address: '0x8755D2e532b1559454689Bf0E8964Bd78b187Ff6'.toLowerCase(),
    name: 'Elderglade',
    symbol: 'ELDE',
    decimals: 18,
  },
  {
    chainId: ChainId.KLAYTN,
    address: '0x23CcAB1de32E06a6235a7997C266F86440C2Cbe6'.toLowerCase(),
    name: 'Delabs Games',
    symbol: 'DELABS',
    decimals: 18,
  },
  {
    chainId: ChainId.KLAYTN,
    address: '0x18Bc5bcC660cf2B9cE3cd51a404aFe1a0cBD3C22'.toLowerCase(),
    name: 'IDRX',
    symbol: 'IDRX',
    decimals: 2,
  },
]

export const MASTERCHEFV3_ADDRESS = '0x6AC953CAD04b0Ce38a454f17D1d92620e456c9C0' as Address
export const V3_NFT_POSITION_MANAGER_ADDRESS = '0x68f762d28CebaD501c090949e4680697e56848fC' as Address

export const DEFAULT_POOLS_FILTERS = {
  poolTypes: poolTypeSelectorOptions.map(({ value }) => value as PoolType),
  boostedOnly: false,
  searchKey: '',
  myPositionOnly: false,
  sortBy: 'apy24H' as const,
  sortDirection: 'desc' as const,
  page: 1,
}

export const TETHER_TOKEN = new Token(
  ChainId.KLAYTN,
  TETHER_ADDRESS.toLowerCase() as Address,
  TETHER_DECIMALS,
  TETHER_SYMBOL,
  TETHER_NAME,
)

export const SYMBOL_ALIASES: Record<string, string[]> = {
  [TETHER_SYMBOL]: ['usdt'],
}

export const TOKEN_MAPPER = {
  usdt: [TETHER_TOKEN],
}

export const REFERRER_FEE_ACCOUNT = '0x0B315Db5574a3AA8b74CC72291327947d871b99E'.toLowerCase() as Address
export const SS_REFERRER_FEE_NUMERATOR = '10'
export const SS_REFERRER_FEE_DENOMINATOR = '100'
export const SIGNER_PK = process.env.SCNR_SIGNER_PK || ''

export const UNIFI_WALLET_GAS = '0x2dc6c0' // For Unifi Wallet, gas estimation may fail with execution revert because USDT is auto-deposited; hardcoding ~3,000,000 is recommended by Unifi Wallet team
export const UNIFI_WALLET_TYPE_INT = 48 // 48 for swap according to Unifi Wallet team
