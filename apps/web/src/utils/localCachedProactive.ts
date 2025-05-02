export function localCachedProactive(fetcher, { interval = 1000 }) {
  const creation = new Error()

  let data
  let initialHandler
  const initialPromise = new Promise((resolve, reject) => {
    initialHandler = { resolve, reject }
  }).catch((err) => console.error({ err, creation }, 'failed to fetch data for localCachedProactive'))

  const fetch = async () => {
    const start = Date.now()
    try {
      data = await fetcher()
      initialHandler?.resolve(data)
    } catch (err) {
      initialHandler?.reject(err)
    }
    initialHandler = null

    setTimeout(fetch, Math.max(0, interval - (Date.now() - start)))
  }

  fetch()

  return async () => {
    if (data) return data
    return initialPromise
  }
}
