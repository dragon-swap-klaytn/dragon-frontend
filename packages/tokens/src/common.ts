import { ChainId } from '@pancakeswap/chains'
import { ERC20Token } from '@pancakeswap/sdk'

export const CAKE = {
  [ChainId.KLAYTN]: new ERC20Token(8217, '0xf898c138f9c8825ceF83CA75535Ed77100497296', 18, 'RKLAY', 'Reward Klay'),
  [ChainId.KLAYTN_TESTNET]: new ERC20Token(
    ChainId.KLAYTN_TESTNET,
    '0x043c471bEe060e00A56CcD02c0Ca286808a5A436',
    18,
    'WKLAY',
    'Wrapped KLAY',
    'https://klaytn.foundation',
  ),
}

export const LEGACY_CAKE_SYMBOL = 'RKLAY'
export const CAKE_SYMBOL = 'RKAIA'
export const CAKE_SYMBOL_VIEW = 'KAIA'

export const NATVIE_TOKEN = new ERC20Token(
  ChainId.KLAYTN,
  '0x0000000000000000000000000000000000000000',
  18,
  'KAIA',
  'KAIA',
)

export const USDC = {
  [ChainId.KLAYTN]: new ERC20Token(
    8217,
    '0x608792Deb376CCE1c9FA4D0E6B7b44f507CfFa6A'.toLowerCase() as `0x${string}`,
    6,
    'USDC',
    'USD Coin',
  ),
}

export const USDT = {
  [ChainId.KLAYTN]: new ERC20Token(
    ChainId.KLAYTN,
    '0x5C13E303a62Fc5DEdf5B52D66873f2E59fEdADC2'.toLowerCase() as `0x${string}`,
    6,
    'USDT',
    'Tether USD',
  ),
  [ChainId.KLAYTN_TESTNET]: new ERC20Token(
    ChainId.KLAYTN_TESTNET,
    '0x37f5A4788b767B9677690D7D454b85ee50d19262'.toLowerCase() as `0x${string}`,
    6,
    'oUSDT',
    'Orbit Bridge Klaytn USD Tether',
  ),
}

// DEV_NOTE [체인설정]_7-8 : stable coin 설정
export const STABLE_COIN = {
  [ChainId.KLAYTN]: USDT[ChainId.KLAYTN],
  [ChainId.KLAYTN_TESTNET]: USDT[ChainId.KLAYTN_TESTNET],
} satisfies Record<ChainId, ERC20Token>
