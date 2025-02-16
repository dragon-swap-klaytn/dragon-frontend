import { PortfolioV2Data, PortfolioV3Data } from 'pages/api/portfolio'
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

type UsePortfolioParams = { account?: Address; poolTypes?: PoolType[]; onlyPoolIds?: Address[]; skip?: boolean }

export default function usePortfolio({
  account,
  poolTypes = ['v3', 'v2'],
  onlyPoolIds,
  skip = false,
}: UsePortfolioParams) {
  const params = buildSearchParams({ account, poolTypes, onlyPoolIds })

  const { data, isLoading, error } = useSWR(
    !skip ? ['/api/portfolio', params] : null,
    async () => {
      const res = await fetch(`/api/portfolio?${params}`)
      const parsed = (await res.json()) as { [poolId: Address]: PortfolioV3Data | PortfolioV2Data }

      return parsed
    },
    {
      refreshInterval: 1_000 * 60 * 10, // 10 minutes
    },
  )

  return {
    portfolio: data,
    portfolioIsLoading: isLoading,
    portfolioError: error,
  }
}
