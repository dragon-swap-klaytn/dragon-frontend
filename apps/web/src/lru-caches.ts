import { createLocalLRUCache } from 'utils/lruCache'

export const blockNumberCache = createLocalLRUCache<number>({ maxSize: 2_048 })

export type PoolV2AccDataCache = { [id: string]: [number, number, number] }
export type PoolV3AccDataCache = { [id: string]: [number, number, number, number, number, number] }

export const v2PoolsAccDataCache = createLocalLRUCache<PoolV2AccDataCache>({ maxSize: 150 })
export const v3PoolsAccDataCache = createLocalLRUCache<PoolV3AccDataCache>({ maxSize: 150 })

export type TokenAccDataCache = { [id: string]: [number, number, number, number, number, number] }

export const v2TokensAccDataCache = createLocalLRUCache<TokenAccDataCache>({ maxSize: 150 })
export const v3TokensAccDataCache = createLocalLRUCache<TokenAccDataCache>({ maxSize: 150 })
