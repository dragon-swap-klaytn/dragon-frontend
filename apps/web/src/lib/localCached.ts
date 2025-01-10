/**
 * `localCached` will cache the return value of the given fetcher to memory storage.
 *
 * options options
 *  ttl: TTL time in milliseconds or a function returns ttl value
 *  ttlOnCatch: TTL time in milliseconds or a function returns ttl value
 */
export function localCached<T>(
  fetcher: (...params: any) => Promise<T> | T,
  { ttl = 1_000, ttlOnCatch = 1_000 }: { ttl?: number; ttlOnCatch?: number } = {},
): (...params: any) => Promise<T> {
  const cached = {}
  const expires = {}

  return async (...params: any) => {
    const key = JSON.stringify(params)

    if (cached[key] && expires[key] && expires[key] > Date.now()) {
      return cached[key]
    }

    const fetcherPromise = fetcher(...params)
    cached[key] = fetcherPromise

    try {
      const result = await fetcherPromise

      expires[key] = Date.now() + ttl
      cached[key] = Promise.resolve(result)

      return result
    } catch (err) {
      expires[key] = Date.now() + ttlOnCatch

      throw err
    }
  }
}
