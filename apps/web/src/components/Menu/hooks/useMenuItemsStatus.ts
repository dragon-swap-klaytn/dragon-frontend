import { useUserCakeLockStatus } from 'hooks/useUserCakeLockStatus'
import { useMemo } from 'react'

export const useMenuItemsStatus = (): Record<string, string> => {
  const isUserLocked = useUserCakeLockStatus()

  return useMemo(() => {
    return {
      ...(isUserLocked && {
        '/pools': 'lock_end',
      }),
    }
  }, [isUserLocked])
}
