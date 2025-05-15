export function localCachedProactiveV2<T = any>(
  fetcher: () => Promise<T>,
  { interval = 1000, logPrefix = '-' }: { interval?: number; logPrefix?: string } = {}, // Add default value for the options object itself
) {
  let data: T | null = null
  let lastError: any = null // To store background fetch errors
  let timeoutId: NodeJS.Timeout | null = null
  let active = true // Polling active state

  let resolveInitialPromise: (value: T) => void
  let rejectInitialPromise: (reason?: any) => void
  let initialPromiseSettled = false

  const initialPromise = new Promise<T>((resolve, reject) => {
    resolveInitialPromise = resolve
    rejectInitialPromise = reject
  })

  const performFetch = async () => {
    if (!active) return // Do not fetch anymore if stopped

    const startTime = Date.now()
    try {
      const newData = await fetcher()
      data = newData
      lastError = null // Reset last error on success

      if (!initialPromiseSettled) {
        resolveInitialPromise(newData)
        initialPromiseSettled = true
      }
    } catch (err: any) {
      lastError = err
      console.error(`localCachedProactive:${logPrefix}:`, err) // Log all fetch errors

      if (!initialPromiseSettled) {
        rejectInitialPromise(err)
        initialPromiseSettled = true // Rejection is also considered settled
      }
      // If data has been successfully loaded at least once,
      // and a background error occurs, keep the existing data.
      // `data` is not changed.
    } finally {
      if (active) {
        const elapsedTime = Date.now() - startTime
        const nextFetchDelay = Math.max(0, interval - elapsedTime)
        timeoutId = setTimeout(performFetch, nextFetchDelay)
      }
    }
  }

  // Immediately start the first fetch
  performFetch()

  const getData = async (): Promise<T> => {
    if (data !== null) {
      return data
    }
    // If data is not yet available (initial fetch is in progress or failed),
    // return initialPromise so the caller can wait or handle the error.
    return initialPromise
  }

  const stop = () => {
    active = false
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
    // If stop is called and initialPromise hasn't settled yet,
    // explicitly reject it to prevent indefinite waiting where getData() is awaited.
    if (!initialPromiseSettled) {
      rejectInitialPromise(new Error('Proactive fetching was stopped before initial fetch completed.'))
      initialPromiseSettled = true
    }
  }

  return {
    getData,
    stop,
    getLastError: () => lastError,
  }
}
