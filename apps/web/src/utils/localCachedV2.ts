/**
 * Asynchronously computes the next TTL (Time-To-Live) value.
 *
 * If `ttl` is a function, it will be called with the resolved `base` value,
 * and its result must be a positive number. Otherwise, `ttl` must be a number.
 *
 * @param ttl - A number or a function that takes a resolved base value and returns a number.
 * @param base - The base value (or a promise resolving to it) used if ttl is a function.
 * @returns A Promise that resolves to a positive number representing the TTL.
 */
const computeNextTTL = async <T = any>(
  ttl: number | ((value: T) => number),
  base?: T | Promise<T>,
): Promise<number> => {
  if (typeof ttl === 'function') {
    if (base === undefined) {
      throw new Error('base should be provided when ttl is a function')
    }
    // Await the resolution of the base value.
    const resolvedBase = await base
    const nextTTL = ttl(resolvedBase)
    if (typeof nextTTL !== 'number') {
      throw new Error(`ttl function must return a number, got: ${typeof nextTTL} - ${nextTTL}`)
    }
    if (nextTTL <= 0) {
      throw new Error(`ttl must be a positive number, got: ${nextTTL}`)
    }
    return nextTTL
  }

  // Validate ttl when provided as a number.
  if (typeof ttl !== 'number') {
    throw new Error(`ttl should be a number, got: ${typeof ttl} - ${ttl}`)
  }
  if (ttl <= 0) {
    throw new Error(`ttl must be a positive number, got: ${ttl}`)
  }
  return ttl
}

/**
 * Provides an in-memory caching mechanism for data fetched via the provided fetcher.
 * It supports configurable TTL values, stale-while-revalidate behavior, and TTL updates
 * on fetch errors.
 *
 * This implementation deduplicates in-flight fetch requests: if multiple mutations occur
 * concurrently (and are not forced), only one fetcher call is made.
 *
 * The `mutate()` function enqueues cache-update operations via a promise chain.
 * When processing a queued mutation, it first checks if the cache is still valid; if so,
 * and if this is not a forced update, it skips the mutation.
 *
 * You can force an update (even if a valid cache exists) by passing `force` as true.
 *
 * @param fetcher - A function that returns a Promise of data (or data directly).
 * @param options - Configuration options:
 *   - staleWhileRevalidate: If true, returns stale data immediately while triggering a background refresh.
 *   - ttl: A number or a function to determine the TTL for a successful fetch.
 *   - ttlOnCatch: A number or a function to determine the TTL when a fetch error occurs.
 *
 * @returns An object with methods:
 *   - cachedFetcher: Returns the cached data (or a fresh fetch if needed).
 *   - mutate: Updates the cache with new data (or a fresh fetch), with an optional force flag.
 *   - invalidate: Alias for mutate (without providing new data).
 */
export const localCachedV2 = <T = any>(
  fetcher: () => Promise<T> | T,
  {
    staleWhileRevalidate = false,
    ttl = 1_000,
    ttlOnCatch = 1_000,
  }: {
    staleWhileRevalidate?: boolean
    ttl?: number | ((value: T) => number)
    ttlOnCatch?: number | ((value: unknown) => number)
  } = {},
) => {
  // In-memory storage for the cached data.
  let cached: T | null = null
  // Timestamp (in ms) when the cache expires.
  let expiresAt: number = 0
  // Deduplicates in-flight fetch requests.
  let inFlightRequest: Promise<T> | null = null
  // A promise chain to serialize mutations.
  let mutationPromise: Promise<void> = Promise.resolve()

  /**
   * Mutate (or invalidate) the cache.
   *
   * If `data` is provided, it is used directly; otherwise, the fetcher is invoked.
   * For non-forced updates, if valid cached data already exists or a fetch is in progress,
   * the existing data or in-flight request is returned to avoid duplication.
   *
   * @param data - Optional data to use for updating the cache.
   * @param force - If true, forces a fetch/update even if cache is valid or a request is in flight.
   * @returns A Promise resolving to the fresh (or provided) data.
   */
  const mutate = (data?: T, force: boolean = false): Promise<T> => {
    const now = Date.now()

    // If not forced and the cache is still valid, return it immediately.
    if (!force && cached !== null && now < expiresAt) {
      return Promise.resolve(cached)
    }
    // If not forced and a fetch is already in flight, return that promise.
    if (!force && inFlightRequest !== null) {
      return inFlightRequest
    }

    // Determine the fresh data:
    // If data is provided, use it; otherwise, invoke the fetcher.
    const freshData: Promise<T> = Promise.resolve(data === undefined ? fetcher() : data)

    // Mark this fetch as in flight.
    inFlightRequest = freshData

    // Enqueue the mutation to serialize cache updates.
    mutationPromise = mutationPromise
      .then(async () => {
        // Re-check expiration inside the queued mutation.
        // If not forced and the cache is still valid, skip this mutation.
        if (!force && Date.now() < expiresAt) {
          return
        }
        try {
          // Wait for the fresh data.
          const resolvedData = await freshData
          // Compute the TTL based on the resolved data.
          const ttlValue = await computeNextTTL(ttl, resolvedData)
          // Update the cache expiration.
          expiresAt = Date.now() + ttlValue
          // Save the new value in the cache.
          cached = resolvedData
        } catch (err) {
          // On error, compute a TTL using ttlOnCatch.
          const ttlCatch = await computeNextTTL(ttlOnCatch, err)
          expiresAt = Date.now() + ttlCatch
          console.error('Error during mutate:', err)
          throw err
        } finally {
          // Clear the in-flight request marker.
          inFlightRequest = null
        }
      })
      .catch((err) => {
        console.error('Error during mutationPromise, recovered to continue further operations.')
        // Recover the chain by returning a resolved promise.
      })

    // Return the promise for the fresh data so that callers may await it.
    return freshData
  }

  /**
   * Invalidate the current cache by forcing a fresh fetch.
   *
   * @returns A Promise resolving to the fresh data.
   */
  const invalidate = (): Promise<T> => {
    return mutate(undefined, true)
  }

  /**
   * Fetch the cached data if valid; otherwise, trigger a fetch.
   *
   * With stale-while-revalidate enabled, stale data is returned immediately
   * while a background refresh is triggered if the cache is expired.
   *
   * @returns A Promise resolving to the cached or freshly fetched data.
   */
  const cachedFetcher = async (): Promise<T> => {
    const now = Date.now()

    // When staleWhileRevalidate is enabled and cache exists,
    // return it immediately and trigger a background refresh if expired.
    if (staleWhileRevalidate && cached !== null) {
      if (expiresAt <= now) {
        mutate().catch((err) => console.error('Background refresh error:', err))
      }
      return cached
    }

    // If cache is valid, return it.
    if (cached !== null && expiresAt > now) {
      return cached
    }

    // Otherwise, fetch fresh data.
    return mutate()
  }

  // Return the caching API.
  return {
    cachedFetcher,
    mutate,
    invalidate,
  }
}
