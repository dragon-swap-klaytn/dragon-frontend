import { useAtom } from 'jotai'
import atomWithStorageWithErrorCatch from 'utils/atomWithStorageWithErrorCatch'

const userUseMMLinkedPoolAtom = atomWithStorageWithErrorCatch<boolean>('pcs:useMMlinkedPool', false)

export function useMMLinkedPoolByDefault() {
  return useAtom(userUseMMLinkedPoolAtom)
}
