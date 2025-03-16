import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

export default function useRouterReady() {
  const router = useRouter()
  const [isRouterReady, setRouterReady] = useState(true)
  useEffect(() => {
    // To remove the query string when navigating to the Pools page from the top menu,
    // it applies after routerChangeComplete, ensuring router.query is cleared.
    const handleRouteChange = () => setRouterReady(false)
    const handleRouteChangeComplete = () => setRouterReady(true)

    router.events.on('routeChangeStart', handleRouteChange)
    router.events.on('routeChangeComplete', handleRouteChangeComplete)

    return () => {
      router.events.off('routeChangeStart', handleRouteChange)
      router.events.off('routeChangeComplete', handleRouteChangeComplete)
    }
  }, [router.events])

  return isRouterReady
}
