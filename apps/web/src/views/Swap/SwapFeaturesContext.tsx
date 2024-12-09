import { useMatchBreakpoints } from '@pancakeswap/uikit'

import { useActiveChainId } from 'hooks/useActiveChainId'
import React, { createContext, useEffect, useMemo, useState } from 'react'
import { useExchangeChartManager } from 'state/user/hooks'

export const SwapFeaturesContext = createContext<{
  // isHotTokenSupported: boolean
  // isChartSupported: boolean
  // isStableSupported: boolean
  // isAccessTokenSupported: boolean
  // isChartExpanded: boolean
  // isChartDisplayed: boolean
}>({
  // isHotTokenSupported: false,
  // isAccessTokenSupported: false,
})

export const SwapFeaturesProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { isMobile } = useMatchBreakpoints()
  const { chainId } = useActiveChainId()
  const [userChartPreference, setUserChartPreference] = useExchangeChartManager(isMobile)
  const [isChartDisplayed, setIsChartDisplayed] = useState(userChartPreference)

  // ACCESS_TOKEN_SUPPORT_CHAIN_IDS

  useEffect(() => {
    setUserChartPreference(isChartDisplayed)
  }, [isChartDisplayed, setUserChartPreference])

  const value = useMemo(
    () => {
      return {
        // isHotTokenSupported,
        // isChartSupported,
        // isStableSupported,
        // isAccessTokenSupported,
        // isChartDisplayed,
        // setIsChartDisplayed,
        // isChartExpanded,
        // setIsChartExpanded,
      }
    },
    [
      // isHotTokenSupported,
      // isChartSupported,
      // isStableSupported,
      // isAccessTokenSupported,
      // isChartDisplayed,
      // setIsChartDisplayed,
      // isChartExpanded,
      // setIsChartExpanded,
    ],
  )

  return <SwapFeaturesContext.Provider value={value as any}>{children}</SwapFeaturesContext.Provider>
}
