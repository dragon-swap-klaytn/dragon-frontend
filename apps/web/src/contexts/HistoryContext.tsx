import { useRouter } from 'next/router'
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react'

const historyManagerContext = createContext<ReturnType<typeof useHistoryManager>>({
  history: [],
  backTo: () => {},
  canGoBack: () => false,
})

export function HistoryManagerProvider({ children }: { children: ReactNode }) {
  const value = useHistoryManager()
  return <historyManagerContext.Provider value={value}>{children}</historyManagerContext.Provider>
}

export const useHistory = () => useContext(historyManagerContext)

function useHistoryManager() {
  const router = useRouter()
  const [history, setHistory] = useState<string[]>(() => [typeof window !== 'undefined' ? router.asPath : '/'])

  useEffect(() => {
    const handleRouteChange = (url: string, { shallow }: { shallow?: boolean }) => {
      if (!shallow) {
        setHistory((prevState) => [...prevState, url])
      }
    }

    // Set our custom handler
    router.beforePopState(() => {
      setHistory((prevState) => (prevState.length > 1 ? prevState.slice(0, -2) : prevState))
      return true
    })

    // Subscribe to route changes
    router.events.on('routeChangeStart', handleRouteChange)

    return () => {
      // Cleanup the routeChangeStart subscription
      router.events.off('routeChangeStart', handleRouteChange)
      // Reset beforePopState to its default behavior by returning true for all events
      router.beforePopState(() => true)
    }
  }, [router])

  const backTo = useCallback(() => {
    if (history.length > 1) {
      router.push(history[history.length - 2])
    } else {
      router.back()
    }
  }, [history, router])

  return {
    backTo,
    history,
    canGoBack: () => history.length > 1,
  }
}
