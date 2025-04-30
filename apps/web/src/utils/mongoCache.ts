import { getDb } from 'lib/mongo'

/**
 * The public API of the LRU cache.
 */
export type MongoCache<T> = {
  /**
   * Gets a value from the cache by key.
   */
  get: (key: number) => Promise<T | null>
  /**
   * Puts a key-value pair into the cache.
   */
  put: (key: number, value: T) => Promise<void>
}

/**
 * Creates a
 */
export function createMongoCache<T = any>({ collectionName }: { collectionName: string }): MongoCache<T> {
  const privateMethods = {
    getCollection: async () => {
      const db = await getDb()
      return db.collection<{ _id: number; value: T; updatedAt: Date }>(collectionName)
    },
  }

  // Public API.
  const publicAPI: MongoCache<T> = {
    /**
     * Gets the value associated with the given key.
     */
    get: async (key: number) => {
      const col = await privateMethods.getCollection()
      let result = await col.findOne({ _id: key }, { projection: { _id: 1, value: 1 } })

      if (!result) {
        result = await col.findOne({ _id: key.toString() as any }, { projection: { _id: 1, value: 1 } })
      }

      return result?.value ?? null
    },

    /**
     * Inserts or updates a key-value pair in the cache.
     */
    put: async (key: number, value: T) => {
      const col = await privateMethods.getCollection()
      await col.replaceOne({ _id: key }, { value, updatedAt: new Date() }, { upsert: true })
    },
  }

  return publicAPI
}
