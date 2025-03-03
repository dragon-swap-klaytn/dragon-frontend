import { DEFAULT_LOCAL_STORAGE_DATA, LOCAL_STORAGE_KEYS } from 'defines/local-storage-keys'
import useLocalStorage from 'hooks/useLocalStorage'
import { useEffect } from 'react'
import { useUserTransactionTTL } from 'state/user/hooks'

export default function useLocalStorageState() {
  const [ttlFromLs] = useLocalStorage<number>(LOCAL_STORAGE_KEYS.txTtl, DEFAULT_LOCAL_STORAGE_DATA.txTtl)
  const [, setTtl] = useUserTransactionTTL()

  useEffect(() => {
    if (ttlFromLs === DEFAULT_LOCAL_STORAGE_DATA.txTtl) {
      return
    }

    setTtl(ttlFromLs)
  }, [ttlFromLs, setTtl])
}
