import { createMongoCache } from 'utils/mongoCache'

export type PoolV2AccDataMongoCache = { [id: string]: [number, number, number] }
export type PoolV3AccDataMongoCache = { [id: string]: [number, number, number, number, number, number] }

export const v2PoolsAccDataMongoCache = createMongoCache<PoolV2AccDataMongoCache>({
  collectionName: 'v2Pools',
})
export const v3PoolsAccDataMongoCache = createMongoCache<PoolV3AccDataMongoCache>({
  collectionName: 'v3Pools',
})

export type TokenAccDataMongoCache = { [id: string]: [number, number, number, number, number, number] }

export const v2TokensAccDataMongoCache = createMongoCache<TokenAccDataMongoCache>({
  collectionName: 'v2Tokens',
})
export const v3TokensAccDataMongoCache = createMongoCache<TokenAccDataMongoCache>({
  collectionName: 'v3Tokens',
})
