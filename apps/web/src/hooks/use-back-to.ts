import { useRouter } from 'next/router'
import { useCallback } from 'react'

const BACKTO_KEY = 'backToHref'

export function useBackTo() {
  const router = useRouter()

  const saveBackToHref = useCallback(() => {
    // save href with query params
    sessionStorage.setItem(BACKTO_KEY, router.asPath)
  }, [router.asPath])

  const getBackToHref = useCallback(() => {
    // get href with query params
    return sessionStorage.getItem(BACKTO_KEY)
  }, [])

  const backTo = useCallback(() => {
    const backToHref = getBackToHref()
    if (backToHref) {
      router.push(backToHref)
    } else {
      router.back()
    }
  }, [getBackToHref, router])

  return {
    saveBackToHref,
    getBackToHref,
    backTo,
  }
}
