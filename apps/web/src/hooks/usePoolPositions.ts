import usePortfolio, { PortfolioV3DataBigInt } from 'hooks/use-portfolio'
import { PortfolioV2Data } from 'pages/api/portfolio'
import { PoolType } from 'types'
import { Address } from 'viem'

export type PositionV2 = PortfolioV2Data
export type PositionV3 = PortfolioV3DataBigInt['positions'][number]

type UsePoolPositionsParams<T extends PoolType> = {
  account?: Address
  poolType: T
  poolAddress: Address
}
type UsePoolPositionsOptions = { paused?: boolean }

export default function usePoolPositions<T extends PoolType>(
  { account, poolType, poolAddress }: UsePoolPositionsParams<T>,
  { paused = false }: UsePoolPositionsOptions = {},
): {
  positions?: T extends 'v2' ? PositionV2[] : PositionV3[]
  isLoading: boolean
  error?: Error
} {
  const { portfolio, error, isLoading } = usePortfolio(
    {
      account,
      onlyPoolIds: [poolAddress],
    },
    { paused },
  )

  if (!portfolio) {
    return {
      positions: undefined,
      isLoading,
      error,
    }
  }

  if (!(poolAddress in portfolio)) {
    return {
      positions: [],
      isLoading,
      error,
    }
  }

  switch (poolType) {
    case 'v2':
      return {
        positions: [portfolio[poolAddress]] as T extends 'v2' ? PositionV2[] : PositionV3[],
        isLoading,
        error,
      }
    case 'v3':
      return {
        positions: (portfolio[poolAddress] as PortfolioV3DataBigInt).positions as T extends 'v2'
          ? PositionV2[]
          : PositionV3[],
        isLoading,
        error,
      }

    default:
      throw new Error('Invalid pool type')
  }
}
