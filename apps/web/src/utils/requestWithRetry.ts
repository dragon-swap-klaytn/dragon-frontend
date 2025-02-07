const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const requestWithRetry = async <T>(
  requestPromise: Promise<T>,
  { retries = 3, initialDelay = 1000, exponentialBackoff = true } = {},
): Promise<T> => {
  let delay = initialDelay

  for (let i = 0; i < retries; i++) {
    try {
      return requestPromise
    } catch (error) {
      if (i === retries - 1) {
        throw error
      }

      // eslint-disable-next-line no-await-in-loop
      await sleep(delay)

      if (exponentialBackoff) {
        delay *= 2
      }
    }
  }

  throw new Error('requestWithRetry: unreachable')
}
