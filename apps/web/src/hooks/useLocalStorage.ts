import { useCallback, useState } from 'react'
import useDeepCompareEffect from 'use-deep-compare-effect'

type UseLocalStorageOptions<T> = {
  onLoadSuccess?: (value: T) => void
  serializer?: (value: T) => string
  deserializer?: (value: string) => T
}

export default function useLocalStorage<T>(
  key: string,
  initialValue: T,
  { onLoadSuccess, serializer = JSON.stringify, deserializer = JSON.parse }: UseLocalStorageOptions<T> = {},
) {
  if (!key) {
    throw new Error('useLocalStorage key may not be falsy')
  }

  const [state, setState] = useState<T>(initialValue)

  const loadFromLocalStorage = useCallback(
    (fallback: T) => {
      let deserializedInitialValue: T

      const localStorageValue = localStorage.getItem(key)

      if (localStorageValue === null) {
        localStorage.setItem(key, serializer(fallback))
        deserializedInitialValue = fallback
      } else {
        deserializedInitialValue = deserializer(localStorageValue)
        onLoadSuccess?.(deserializedInitialValue)
      }

      setState(deserializedInitialValue)
    },
    [key, serializer, deserializer, onLoadSuccess],
  )

  useDeepCompareEffect(() => {
    loadFromLocalStorage(initialValue)
  }, [initialValue, key, serializer, deserializer])

  const set = useCallback(
    (value: T) => {
      localStorage.setItem(key, serializer(value))

      setState(value)
    },
    [key, serializer],
  )

  return [state, set, loadFromLocalStorage] as const
}
