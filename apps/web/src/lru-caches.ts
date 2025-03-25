import { TokenAccData } from 'lib/graph-queries/types'
import { createLocalLRUCache } from 'utils/lruCache'

export const blockNumberCache = createLocalLRUCache<number>({ maxSize: 1_024 })

export type PoolV2AccDataCache = { [id: string]: [number, number, number] }
export type PoolV3AccDataCache = { [id: string]: [number, number, number, number, number, number] }

export const v2PoolsAccDataCache = createLocalLRUCache<PoolV2AccDataCache>({ maxSize: 1_024 })
export const v3PoolsAccDataCache = createLocalLRUCache<PoolV3AccDataCache>({ maxSize: 1_024 })

export const v2TokensAccDataCache = createLocalLRUCache<{ [id: string]: Omit<TokenAccData, 'id'> }>({ maxSize: 1_024 })
export const v3TokensAccDataCache = createLocalLRUCache<{ [id: string]: Omit<TokenAccData, 'id'> }>({ maxSize: 1_024 })
