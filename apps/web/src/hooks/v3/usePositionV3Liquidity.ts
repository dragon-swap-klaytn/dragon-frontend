import { PositionDetails } from '@pancakeswap/farms'
import { Currency, CurrencyAmount, Token } from '@pancakeswap/sdk'
import { FeeAmount, Position } from '@pancakeswap/v3-sdk'
import { useStablecoinPrice } from 'hooks/useBUSDPrice'
import { useMemo } from 'react'
import { usePool } from './usePools'

interface LiquidityTotalHookProps {
  token0: Token
  token1: Token
  feeAmount: FeeAmount
  positionsDetailsList: PositionDetails[]
}

export function useV3LiquidityTotal({
  token0,
  token1,
  feeAmount,
  positionsDetailsList,
}: LiquidityTotalHookProps): CurrencyAmount<Currency> | null {
  const [, pool] = usePool(token0 ?? undefined, token1 ?? undefined, feeAmount)
  const positions = useMemo(() => {
    return positionsDetailsList.map(({ liquidity, tickLower, tickUpper }) => {
      if (pool && typeof liquidity === 'bigint' && typeof tickLower === 'number' && typeof tickUpper === 'number') {
        return new Position({ pool, liquidity: liquidity.toString(), tickLower, tickUpper })
      }

      return undefined
    })
  }, [positionsDetailsList, pool])

  const price0 = useStablecoinPrice(token0 ?? undefined, { enabled: Boolean(token0) })
  const price1 = useStablecoinPrice(token1 ?? undefined, { enabled: Boolean(token1) })

  return useMemo(() => {
    if (!price0 || !price1) return null

    const liqArr = positions.map((position) => {
      const amount0 = position?.amount0 ? price0.quote(position?.amount0) : CurrencyAmount.fromRawAmount(token0, 0)
      const amount1 = position?.amount1 ? price1.quote(position?.amount1) : CurrencyAmount.fromRawAmount(token1, 0)
      return amount0.add(amount1)
    })

    return liqArr.reduce((sum, liquidity) => (sum ? sum.add(liquidity) : sum))
  }, [positions, price0, price1, token0, token1])
}
