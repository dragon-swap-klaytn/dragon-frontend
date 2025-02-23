import { Currency } from '@pancakeswap/swap-sdk-core'

export const LOCAL_STORAGE_KEYS = {
  recentSelectedCurrencies: 'recent-selected-currencies',
}

type LocalStorageKey = keyof typeof LOCAL_STORAGE_KEYS
export const DEFAULT_LOCAL_STORAGE_DATA: { [key in LocalStorageKey]: any } = {
  recentSelectedCurrencies: [] as Currency[],
}
