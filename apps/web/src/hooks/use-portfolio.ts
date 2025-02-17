import { PortfolioPosition, PortfolioV2Data, PortfolioV3Data } from 'pages/api/portfolio'
import useSWR from 'swr'
import { PoolType } from 'types'
import { Address } from 'viem'

function buildSearchParams({
  account,
  poolTypes,
  onlyPoolIds,
}: Pick<UsePortfolioParams, 'account' | 'poolTypes' | 'onlyPoolIds'>) {
  const params = new URLSearchParams()
  if (account) {
    params.append('account', account)
  }
  if (poolTypes) {
    params.set('poolTypes', poolTypes.join(','))
  }
  if (onlyPoolIds) {
    params.set('onlyPoolIds', onlyPoolIds.join(','))
  }
  return params.toString()
}

export type Portfolio = {
  [poolId: Address]: PortfolioV3DataBigInt | PortfolioV2Data
}

type UsePortfolioParams = {
  account?: Address
  poolTypes?: PoolType[]
  onlyPoolIds?: Address[]
}
type UsePortfolioOptions = {
  paused?: boolean
}

export type PortfolioPositionBigInt = Omit<PortfolioPosition, 'liquidity' | 'sqrtPriceX96'> & {
  liquidity: bigint
  sqrtPriceX96: bigint
}

export type PortfolioV3DataBigInt = Omit<PortfolioV3Data, 'positions'> & {
  positions: PortfolioPositionBigInt[]
}

export default function usePortfolio(
  { account, poolTypes = ['v3', 'v2'], onlyPoolIds }: UsePortfolioParams,
  { paused = false }: UsePortfolioOptions = {},
) {
  const params = buildSearchParams({ account, poolTypes, onlyPoolIds })

  const { data, mutate, isLoading, error } = useSWR(
    !paused && !!account ? ['/api/portfolio', params] : null,
    async () => {
      const res = await fetch(`/api/portfolio?${params}`)
      const parsed = (await res.json()) as { [poolId: Address]: PortfolioV3Data | PortfolioV2Data }

      return Object.values(parsed)
        .map((portfolioData) => {
          if ('positions' in portfolioData) {
            return {
              ...portfolioData,
              positions: portfolioData.positions.map((position) => ({
                ...position,
                liquidity: BigInt(position.liquidity),
                sqrtPriceX96: BigInt(position.sqrtPriceX96),
              })),
            } as PortfolioV3DataBigInt
          }
          return portfolioData as PortfolioV2Data
        })
        .reduce(
          (acc, portfolioData) => ({
            ...acc,
            [portfolioData.poolId]: portfolioData,
          }),
          {} as Portfolio,
        )
    },
    {
      refreshInterval: 1_000 * 60 * 10, // 10 minutes
    },
  )

  return {
    portfolio: data,
    mutatePortfolio: mutate,
    isLoading,
    error,
  }
}
