import { Position } from '@pancakeswap/v3-sdk'
import { useCurrency } from 'hooks/Tokens'
import { PositionV3 } from 'hooks/use-portfolio'
import { usePool } from './usePools'

export function useDerivedPositionInfoV2(portfolio: PositionV3, fee: number) {
  const currency0 = useCurrency(portfolio.token0.address)
  const currency1 = useCurrency(portfolio.token1.address)

  // construct pool data
  const [, pool] = usePool(currency0 ?? undefined, currency1 ?? undefined, fee)

  if (!pool || !portfolio) {
    return {
      position: undefined,
      pool: undefined,
    }
  }

  return {
    position: new Position({
      pool,
      liquidity: portfolio.liquidity.toString(),
      tickLower: portfolio.lower,
      tickUpper: portfolio.upper,
    }),
    pool: pool ?? undefined,
  }
}
