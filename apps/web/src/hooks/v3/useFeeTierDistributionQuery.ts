/* eslint-disable */
import { useQuery } from '@tanstack/react-query'
import { gql } from 'graphql-request'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { useMemo } from 'react'
import { v3Clients } from 'utils/graphql'

const query = gql`
  query FeeTierDistribution($token0: String!, $token1: String!) {
    _meta {
      block {
        number
      }
    }
    asToken0: pools(
      orderBy: totalValueLockedToken0
      orderDirection: desc
      where: { token0: $token0, token1: $token1 }
    ) {
      feeTier
      totalValueLockedToken0
      totalValueLockedToken1
    }
    asToken1: pools(
      orderBy: totalValueLockedToken0
      orderDirection: desc
      where: { token0: $token1, token1: $token0 }
    ) {
      feeTier
      totalValueLockedToken0
      totalValueLockedToken1
    }
  }
`

type FeeTierWithTVL = {
  feeTier: string
  totalValueLockedToken0: string
  totalValueLockedToken1: string
}
type FeeTierDistributionQueryResult = {
  _meta: {
    block: {
      number: number
    }
  }
  asToken0: FeeTierWithTVL[]
  asToken1: FeeTierWithTVL[]
}

// Philip TODO: add FeeTierDistributionQuery type
export default function useFeeTierDistributionQuery(
  token0: string | undefined,
  token1: string | undefined,
  interval: number,
) {
  const { chainId } = useActiveChainId()
  const { data, isLoading, error } = useQuery<FeeTierDistributionQueryResult>(
    [`useFeeTierDistributionQuery-${token0}-${token1}`],
    async () => {
      if (!chainId) return undefined
      return v3Clients[chainId].request(query, {
        token0: token0?.toLowerCase(),
        token1: token1?.toLowerCase(),
      })
    },
    {
      enabled: Boolean(token0 && token1 && chainId && v3Clients[chainId]),
      refetchInterval: interval,
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
    },
  )

  return useMemo(
    () => ({
      error,
      isLoading: false, // TODO : query 적용
      data,
    }),
    [data, error, isLoading],
  )
}
