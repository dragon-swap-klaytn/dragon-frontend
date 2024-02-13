import { ChainId } from '@pancakeswap/chains'
import { ContextData, TranslationKey } from '@pancakeswap/localization'
import { SUPPORT_BUY_CRYPTO } from 'config/constants/supportChains'

export const SUPPORTED_ONRAMP_TOKENS = ['ETH', 'DAI', 'USDT', 'USDC', 'BUSD', 'BNB']
export const DEFAULT_FIAT_CURRENCIES = ['USD', 'EUR', 'GBP', 'HKD', 'CAD', 'AUD', 'BRL', 'JPY', 'KRW', 'VND']

const SUPPORTED_MERCURYO_BSC_TOKENS = ['BNB', 'BUSD']
const SUPPORTED_MERCURYO_ETH_TOKENS = ['ETH', 'USDT', 'DAI']

const SUPPORTED_MONPAY_ETH_TOKENS = ['ETH', 'USDC', 'DAI', 'USDT']
const SUPPORTED_MOONPAY_BSC_TOKENS = ['BNB', 'BUSD']

const SUPPORTED_TRANSAK_BSC_TOKENS = ['BNB', 'BUSD']
const SUPPORTED_TRANSAK_ETH_TOKENS = ['ETH', 'USDT', 'DAI']

export const CURRENT_CAMPAIGN_TIMESTAMP = 1694512859

export enum ONRAMP_PROVIDERS {
  MoonPay = 'MoonPay',
  Mercuryo = 'Mercuryo',
  Transak = 'Transak',
}

export enum FeeTypes {
  TotalFees = 'Est. Total Fees',
  NetworkingFees = 'Networking Fees',
  ProviderFees = 'Provider Fees',
}

const MOONPAY_FEE_TYPES = [FeeTypes.TotalFees, FeeTypes.NetworkingFees, FeeTypes.ProviderFees]
const MERCURYO_FEE_TYPES = [FeeTypes.TotalFees]

export const supportedTokenMap: {
  [chainId: number]: {
    [ONRAMP_PROVIDERS.MoonPay]: string[]
    [ONRAMP_PROVIDERS.Mercuryo]: string[]
    [ONRAMP_PROVIDERS.Transak]: string[]
  }
} = {
  [ChainId.BSC]: {
    [ONRAMP_PROVIDERS.MoonPay]: SUPPORTED_MOONPAY_BSC_TOKENS,
    [ONRAMP_PROVIDERS.Mercuryo]: SUPPORTED_MERCURYO_BSC_TOKENS,
    [ONRAMP_PROVIDERS.Transak]: SUPPORTED_TRANSAK_BSC_TOKENS,
  },
  [ChainId.ETHEREUM]: {
    [ONRAMP_PROVIDERS.MoonPay]: SUPPORTED_MONPAY_ETH_TOKENS,
    [ONRAMP_PROVIDERS.Mercuryo]: SUPPORTED_MERCURYO_ETH_TOKENS,
    [ONRAMP_PROVIDERS.Transak]: SUPPORTED_TRANSAK_ETH_TOKENS,
  },
  // Add more chainId mappings as needed
}

export const whiteListedFiatCurrenciesMap: {
  [chainId: number]: string[]
} = {
  [ChainId.BSC]: DEFAULT_FIAT_CURRENCIES,
  [ChainId.ETHEREUM]: DEFAULT_FIAT_CURRENCIES,
}

export function isBuyCryptoSupported(chain: ChainId) {
  return SUPPORT_BUY_CRYPTO.includes(chain)
}

export const providerFeeTypes: { [provider in ONRAMP_PROVIDERS]: FeeTypes[] } = {
  [ONRAMP_PROVIDERS.MoonPay]: MOONPAY_FEE_TYPES,
  [ONRAMP_PROVIDERS.Mercuryo]: MERCURYO_FEE_TYPES,
  [ONRAMP_PROVIDERS.Transak]: MOONPAY_FEE_TYPES,
}

export const getNetworkDisplay = (chainId: number | undefined): string => {
  switch (chainId as ChainId) {
    case ChainId.ETHEREUM:
      return 'Ethereum'
    case ChainId.BSC:
      return 'BNB Chain'
    default:
      return ''
  }
}

export const chainIdToMercuryoNetworkId: { [id: number]: string } = {
  [ChainId.ETHEREUM]: 'ETHEREUM',
  [ChainId.BSC]: 'BINANCESMARTCHAIN',
}

export const chainIdToMoonPayNetworkId: { [id: number]: string } = {
  [ChainId.ETHEREUM]: '',
  [ChainId.BSC]: '_bsc',
}

export const chainIdToTransakNetworkId: { [id: number]: string } = {
  [ChainId.ETHEREUM]: 'ethereum',
  [ChainId.BSC]: 'bsc',
}

export const combinedNetworkIdMap: {
  [provider in keyof typeof ONRAMP_PROVIDERS]: { [id: number]: string }
} = {
  [ONRAMP_PROVIDERS.MoonPay]: chainIdToMoonPayNetworkId,
  [ONRAMP_PROVIDERS.Mercuryo]: chainIdToMercuryoNetworkId,
  [ONRAMP_PROVIDERS.Transak]: chainIdToTransakNetworkId,
}

export const fiatCurrencyMap: Record<string, { symbol: string; name: string }> = {
  USD: {
    name: 'United States Dollar',
    symbol: 'USD',
  },
  EUR: {
    name: 'Euro',
    symbol: 'EUR',
  },
  GBP: {
    name: 'Great British Pound',
    symbol: 'GBP',
  },
  HKD: {
    name: 'Hong Kong Dollar',
    symbol: 'HKD',
  },
  CAD: {
    name: 'Canadian Dollar',
    symbol: 'CAD',
  },
  AUD: {
    name: 'Australian Dollar',
    symbol: 'AUD',
  },
  BRL: {
    name: 'Brazilian Real',
    symbol: 'BRL',
  },
  JPY: {
    name: 'Japanese Yen',
    symbol: 'JPY',
  },
  KRW: {
    name: 'South Korean Won',
    symbol: 'KRW',
  },
  TWD: {
    name: 'New Taiwan Dollar',
    symbol: 'TWD',
  },
  IDR: {
    name: 'Indonesian Rupiah',
    symbol: 'IDR',
  },
  SGD: {
    name: 'Singapore Dollar',
    symbol: 'SGD',
  },
  VND: {
    name: 'Vietnamese Dong',
    symbol: 'VND',
  },
}
