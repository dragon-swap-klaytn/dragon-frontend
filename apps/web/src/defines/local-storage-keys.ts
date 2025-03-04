import { Currency } from '@pancakeswap/swap-sdk-core'

export const LOCAL_STORAGE_KEYS = {
  recentSelectedCurrencies: 'recent-selected-currencies',
  slippageTolerance: 'slippage-tolerance',
  txTtl: 'tx-ttl',
  expertMode: 'expert-mode',
  customizingRoute: 'customizing-route',
  recentTransactions: 'recent-transactions',
}

export const DEFAULT_LOCAL_STORAGE_DATA = {
  recentSelectedCurrencies: [] as Currency[],
  slippageTolerance: 0.5,
  txTtl: 60,
  expertMode: false,
  customizingRoute: {
    v3: true,
    v2: true,
    allowMultihops: true,
    allowSplitRouting: true,
  },
}
