import useTokenPrices from 'hooks/useTokenPrices'
import { useMemo } from 'react'

export default function useTokenPricesWithFallback({
  refreshInterval = 1000 * 30,
}: {
  refreshInterval?: number
} = {}) {
  const { prices } = useTokenPrices({ refreshInterval })
  // use swapscanner price as fallback
  const { prices: ssPrices } = useTokenPrices({ source: 'swapscanner', refreshInterval })

  const priceMap = useMemo(
    () => ({
      ...ssPrices,
      ...prices,
    }),
    [prices, ssPrices],
  )

  return {
    priceMap,
  }
}
