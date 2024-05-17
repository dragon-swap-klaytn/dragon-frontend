import { useMemo } from 'react'
import { useRouter } from 'next/router'

export function useFinishedFarm() {
  const { pathname } = useRouter()

  return useMemo(() => {
    return pathname === '/farms/finished'
  }, [pathname])
}