import { useMatchBreakpoints } from '@pancakeswap/uikit'
import { atom, useAtom } from 'jotai'
import atomWithStorageWithErrorCatch from 'utils/atomWithStorageWithErrorCatch'

const isSwapHotTokenDisplay = atomWithStorageWithErrorCatch<boolean>('pcs:isHotTokensDisplay', false)
const isSwapHotTokenDisplayETH = atomWithStorageWithErrorCatch<boolean>('pcs:isHotTokensDisplayETH', true)
const isHotTokensDisplayMobile = atom(false)
const isHotTokensDisplayTmp = atom(false)

export const useSwapHotTokenDisplay = () => {
  const { isMobile } = useMatchBreakpoints()
  // const { isChartSupported } = useContext(SwapFeaturesContext)
  return useAtom(
    // isMobile ? isHotTokensDisplayMobile : isChartSupported ? isSwapHotTokenDisplay : isSwapHotTokenDisplayETH,
    isHotTokensDisplayTmp,
  )
}
