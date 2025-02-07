/**
 * `computeNextTTL` will compute the next ttl value from the given ttl and base.
 */
const computeNextTTL = <T = any>(ttl: number | ((value: T | Promise<T>) => number), base?: T | Promise<T>) => {
  const isFunction = typeof ttl === 'function'
  let nextTTL: number
  if (isFunction) {
    if (!base) {
      throw new Error('base should be provided when ttl is a function')
    }
    nextTTL = ttl(base)
  } else {
    nextTTL = ttl
  }

  if (typeof nextTTL !== 'number') {
    throw new Error(`ttl should be a number: ${typeof nextTTL} - ${nextTTL}`)
  }

  if (nextTTL < 0) {
    throw new Error(`ttl should be a positive number: ${nextTTL}`)
  }

  return nextTTL
}

/**
 * `localCachedV2` will cache the return value to memory from the given fetcher with provided `ttl`.
 */
export const localCachedV2 = <T = any>(
  fetcher: () => Promise<T> | T,
  {
    ttl = 1_000,
    ttlOnCatch = 1_000,
  }: {
    ttl?: number | ((value: T | Promise<T>) => number)
    ttlOnCatch?: number | ((value: T | Promise<T>) => number)
  } = {},
) => {
  let cached: Promise<T> | T
  let expiresAt: number

  /**
   * mutation function that updates cached value to provided data and invalidates once called.
   */
  const mutate = (data?: T) => {
    // invalidate value using the given `fetcher` if `data` is not provided.
    if (data === undefined) {
      cached = fetcher()
    } else {
      cached = data
    }

    expiresAt = Date.now() + computeNextTTL(ttl, cached)

    const previousExpiresAt = expiresAt
    Promise.resolve(cached)
      .catch((err) => {
        // check if we are still on the same ttl cycle.
        if (previousExpiresAt === expiresAt) {
          expiresAt = Date.now() + computeNextTTL(ttlOnCatch, err)
        }
      })
      .catch((err) => console.error({ err }, 'failed to update ttl on catch'))

    return cached
  }

  /**
   * an alias of `() => mutate()`
   * this invalidates the previous cached value and returns it.
   */
  const invalidate = () => mutate()

  /**
   * get cached value or fresh value if cached one has been expired.
   *
   */
  const cachedFetcher = () => {
    if (cached && expiresAt && expiresAt > Date.now()) {
      return cached
    }

    return invalidate()
  }

  return {
    cachedFetcher,
    mutate,
    invalidate,
  }
}
