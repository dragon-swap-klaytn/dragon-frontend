import { useMatchBreakpoints } from '@pancakeswap/uikit'
import { useMemo } from 'react'
import { useAccount } from 'wagmi'

const useKlipQrCondition = () => {
  const { connector } = useAccount()

  const isKlip = useMemo(() => {
    return connector?.id === 'klip'
  }, [connector])

  const { isMobile } = useMatchBreakpoints()

  return isKlip && !isMobile
}

export default useKlipQrCondition
