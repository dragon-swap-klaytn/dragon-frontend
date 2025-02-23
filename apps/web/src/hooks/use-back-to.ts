import { useRouter } from 'next/router'
import { useCallback } from 'react'

const BACKTO_HISTORY_KEY = 'backToHistory'

/**
 * Custom hook to manage navigation history using a stack stored in sessionStorage.
 *
 * This hook provides the following functions:
 * - saveBackToHref: Saves the current URL to the history stack.
 * - getBackToHref: Retrieves the top URL from the history stack without removing it.
 * - backTo: Navigates back to the last saved URL, or falls back to router.back() if the stack is empty.
 *
 * Usage:
 *   const { saveBackToHref, getBackToHref, backTo } = useBackTo();
 */
export function useBackTo() {
  const router = useRouter()

  /**
   * Push a URL onto the history stack stored in sessionStorage.
   *
   * @param url - The URL to be added to the history stack.
   */
  const pushHistory = useCallback((url: string) => {
    const existingStack = sessionStorage.getItem(BACKTO_HISTORY_KEY)
    let stack: string[] = []
    if (existingStack) {
      try {
        stack = JSON.parse(existingStack)
      } catch {
        stack = []
      }
    }
    stack.push(url)
    sessionStorage.setItem(BACKTO_HISTORY_KEY, JSON.stringify(stack))
  }, [])

  /**
   * Pop the last URL from the history stack stored in sessionStorage.
   *
   * @returns The last URL from the stack, or null if the stack is empty.
   */
  const popHistory = useCallback((): string | null => {
    const existingStack = sessionStorage.getItem(BACKTO_HISTORY_KEY)
    if (!existingStack) return null
    let stack: string[] = []
    try {
      stack = JSON.parse(existingStack)
    } catch {
      stack = []
    }
    const url = stack.pop() || null
    sessionStorage.setItem(BACKTO_HISTORY_KEY, JSON.stringify(stack))
    return url
  }, [])

  /**
   * Save the current URL by pushing it onto the history stack.
   */
  const saveBackToHref = useCallback(() => {
    pushHistory(router.asPath)
  }, [pushHistory, router.asPath])

  /**
   * Retrieve the top URL from the history stack without removing it.
   *
   * @returns The current top URL from the stack, or null if the stack is empty.
   */
  const getBackToHref = useCallback((): string | null => {
    const existingStack = sessionStorage.getItem(BACKTO_HISTORY_KEY)
    if (!existingStack) return null
    let stack: string[] = []
    try {
      stack = JSON.parse(existingStack)
    } catch {
      stack = []
    }
    return stack.length > 0 ? stack[stack.length - 1] : null
  }, [])

  /**
   * Navigate back to the last URL saved in the history stack.
   * If the stack is empty, falls back to router.back().
   */
  const backTo = useCallback(() => {
    const backToHref = popHistory()
    if (backToHref) {
      router.push(backToHref)
    } else {
      router.back()
    }
  }, [popHistory, router])

  return {
    saveBackToHref,
    getBackToHref,
    backTo,
  }
}
