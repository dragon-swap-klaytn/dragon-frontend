import { ChainId } from '@pancakeswap/chains'
import { PairDataTimeWindowEnum } from '@pancakeswap/uikit'
import usePairPriceChartTokenData from 'hooks/v3/usePairPriceChartTokenData'
import { useMemo } from 'react'

export const usePairTokensPrice = (pairAddress?: string, duration?: PairDataTimeWindowEnum, chainId?: ChainId) => {
  const priceTimeWindow = useMemo(() => {
    switch (duration) {
      case PairDataTimeWindowEnum.DAY:
        return 'day'
      case PairDataTimeWindowEnum.WEEK:
        return 'week'
      case PairDataTimeWindowEnum.MONTH:
        return 'month'
      case PairDataTimeWindowEnum.YEAR:
        return 'year'
      default:
        return undefined
    }
  }, [duration])

  const pairPrice = usePairPriceChartTokenData(pairAddress?.toLowerCase(), priceTimeWindow, chainId)

  const pairPriceData: { time: Date; value: number }[] = useMemo(() => {
    return pairPrice?.data
      ?.map((d) => {
        if (!d.time) {
          return null
        }

        return {
          time: new Date(d.time * 1_000),
          value: d.close,
        }
      })
      .filter((d) => d !== null) as { time: Date; value: number }[]
  }, [pairPrice])

  return useMemo(
    () => ({
      pairPriceData,
      maxPrice: pairPrice?.maxPrice,
      minPrice: pairPrice?.minPrice,
      averagePrice: pairPrice?.averagePrice,
    }),
    [pairPriceData, pairPrice],
  )
}
