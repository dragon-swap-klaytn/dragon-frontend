import { useAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

export const userSingleHopAtom = atomWithStorage<boolean>('dgs:single-hop', false)

export function useUserSingleHopOnly() {
  return useAtom(userSingleHopAtom)
}
