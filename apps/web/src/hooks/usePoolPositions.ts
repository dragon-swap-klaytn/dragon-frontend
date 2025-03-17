import usePortfolio, { Portfolio, PortfolioV3DataBigInt, PositionV2, PositionV3 } from 'hooks/usePortfolio'
import { KeyedMutator } from 'swr'
import { PoolType } from 'types'
import { Address } from 'viem'

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
  mutatePositions: KeyedMutator<Portfolio>
} {
  const { portfolio, error, isLoading, mutatePortfolio } = usePortfolio(
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
      mutatePositions: mutatePortfolio,
    }
  }

  if (!(poolAddress in portfolio)) {
    return {
      positions: [],
      isLoading,
      error,
      mutatePositions: mutatePortfolio,
    }
  }

  switch (poolType) {
    case 'v2':
      return {
        positions: [portfolio[poolAddress]] as T extends 'v2' ? PositionV2[] : PositionV3[],
        isLoading,
        error,
        mutatePositions: mutatePortfolio,
      }
    case 'v3':
      return {
        positions: (portfolio[poolAddress] as PortfolioV3DataBigInt).positions as T extends 'v2'
          ? PositionV2[]
          : PositionV3[],
        isLoading,
        error,
        mutatePositions: mutatePortfolio,
      }

    default:
      throw new Error('Invalid pool type')
  }
}
