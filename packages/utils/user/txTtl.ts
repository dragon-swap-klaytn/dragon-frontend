import { atom, useAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

export const INITIAL_TX_TTL = 60

const userTxTtlAtom = atomWithStorage('dgs:tx-ttl', INITIAL_TX_TTL)

const userTxTtlAtomWithLocalStorage = atom(
  (get) => get(userTxTtlAtom),
  (_get, set, ttl: number) => {
    if (typeof ttl === 'number') {
      set(userTxTtlAtom, ttl * 60)
    }
  },
)

export const useUserTxTtl = () => {
  return useAtom(userTxTtlAtomWithLocalStorage)
}
