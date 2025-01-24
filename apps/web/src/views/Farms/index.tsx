import Router from 'next/router'
import { useEffect } from 'react'
import { FarmsContext, FarmsV3Context } from './context'
import FarmsV3 from './FarmsV3'

export const FarmsV3PageLayout: React.FC<React.PropsWithChildren<unknown>> = ({ children }) => {
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_DISABLE_FARM === '1') {
      Router.replace('/liquidity').finally(() => {})
    }
  }, [])

  return <FarmsV3>{children}</FarmsV3>
}

export { FarmsContext, FarmsV3Context }
