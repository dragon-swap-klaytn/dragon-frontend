import { PoolV2AccData, PoolV3AccData } from 'lib/graph-queries/types'
import { createLocalLRUCache } from 'utils/lruCache'

export const blockNumberCache = createLocalLRUCache<number>({ maxSize: 2_000 })

export const v2PoolsAccDataCache = createLocalLRUCache<{ [id: string]: Omit<PoolV2AccData, 'id'> }>({ maxSize: 2_000 })
export const v3PoolsAccDataCache = createLocalLRUCache<{ [id: string]: Omit<PoolV3AccData, 'id'> }>({ maxSize: 2_000 })
