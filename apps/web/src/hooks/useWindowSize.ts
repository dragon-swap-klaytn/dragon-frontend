import { useCallback, useEffect, useState } from 'react'

import { useWindowEvent } from './useWindowEvent'

type Size = {
  width: number
  height: number
}

export function useWindowSize(initialSize: Size = { width: 0, height: 0 }) {
  const [size, setSize] = useState<Size>(initialSize)

  const handler = useCallback(() => setSize({ width: window.innerWidth, height: window.innerHeight }), [])

  useWindowEvent('resize', handler)
  useEffect(handler, [handler])

  return size
}
