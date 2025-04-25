/* eslint-disable */
import { PositionDetails } from '@pancakeswap/farms'
import { masterChefV3ABI } from '@pancakeswap/v3-sdk'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { useMasterchefV3, useV3NFTPositionManagerContract } from 'hooks/useContract'
import { useIsClient } from 'hooks/useIsClient'
import usePortfolio, { PortfolioV3DataBigInt } from 'hooks/usePortfolio'
import { useCallback, useEffect, useMemo } from 'react'
import { Address, useContractRead, useContractReads } from 'wagmi'

interface UseV3PositionsResults {
  loading: boolean
  refetch: () => void
  positions: PositionDetails[] | undefined
}

interface UseV3PositionResults {
  loading: boolean
  refetch: () => void
  position: PositionDetails | undefined
}

export function useV3PositionsFromTokenIds(tokenIds: bigint[] | undefined): UseV3PositionsResults {
  const positionManager = useV3NFTPositionManagerContract()
  const { chainId } = useActiveChainId()

  const isClient = useIsClient()
  const inputs = useMemo(
    () =>
      isClient && tokenIds && positionManager
        ? tokenIds.map((tokenId) => ({
            abi: positionManager.abi,
            address: positionManager.address,
            functionName: 'positions',
            args: [tokenId],
            chainId,
          }))
        : [],
    [chainId, positionManager, tokenIds, isClient],
  )
  const {
    isLoading,
    data: positions = [],
    refetch,
  } = useContractReads({
    contracts: inputs,
    watch: true,
    allowFailure: true,
    enabled: isClient && !!inputs.length,
    keepPreviousData: true,
  })

  return {
    loading: isLoading,
    refetch,
    positions: useMemo(
      () =>
        positions
          .filter((p) => p.status === 'success')
          .map((p) => {
            const r = p.result as any
            return {
              nonce: r[0],
              operator: r[1],
              token0: r[2],
              token1: r[3],
              fee: r[4],
              tickLower: r[5],
              tickUpper: r[6],
              liquidity: r[7],
              feeGrowthInside0LastX128: r[8],
              feeGrowthInside1LastX128: r[9],
              tokensOwed0: r[10],
              tokensOwed1: r[11],
            } as Omit<PositionDetails, 'tokenId'>
          })
          .map((position, i) =>
            position && typeof inputs?.[i]?.args[0] !== 'undefined'
              ? {
                  ...position,
                  tokenId: inputs?.[i]?.args[0],
                }
              : null,
          )
          .filter(Boolean) as PositionDetails[],
      [inputs, positions],
    ),
  }
}

export function useV3PositionFromTokenId(tokenId: bigint | undefined): UseV3PositionResults {
  const position = useV3PositionsFromTokenIds(tokenId ? [tokenId] : undefined)

  return useMemo(
    () => ({
      loading: position.loading,
      position: position.positions?.[0],
      refetch: position.refetch,
    }),
    [position.loading, position.positions],
  )
}

export function useV3TokenIdsByAccount(contractAddress?: Address, account?: Address | null | undefined) {
  const { chainId, isWrongNetwork } = useActiveChainId()

  const enabled = useMemo(
    () => !!account && !!contractAddress && contractAddress !== '0x' && !isWrongNetwork,
    [account, contractAddress, isWrongNetwork],
  )

  const {
    isLoading: balanceLoading,
    data: accountBalance,
    refetch: refetchBalance,
  } = useContractRead({
    abi: masterChefV3ABI,
    address: contractAddress as Address,
    args: [account || '0x'],
    functionName: 'balanceOf',
    enabled,
    watch: true,
    chainId,
  })

  const tokenIdsArgs = useMemo(() => {
    if (accountBalance && account) {
      const tokenRequests: {
        abi: typeof masterChefV3ABI
        address: Address
        functionName: 'tokenOfOwnerByIndex'
        args: [Address, number]
        chainId: number
      }[] = []
      for (let i = 0; i < accountBalance; i++) {
        tokenRequests.push({
          abi: masterChefV3ABI,
          address: contractAddress as Address,
          functionName: 'tokenOfOwnerByIndex',
          args: [account, i],
          chainId,
        })
      }
      return tokenRequests
    }
    return []
  }, [account, accountBalance, chainId, contractAddress])

  const {
    isLoading: someTokenIdsLoading,
    data: tokenIds = [],
    refetch: refetchTokenIds,
  } = useContractReads({
    contracts: tokenIdsArgs,
    watch: true,
    allowFailure: true,
    enabled: !!tokenIdsArgs.length,
    keepPreviousData: true,
  })

  // refetch when account changes, It seems like the useContractReads doesn't refetch when the account changes on production
  // check if we can remove this effect when we upgrade to the latest version of wagmi
  useEffect(() => {
    if (account) {
      refetchBalance()
      refetchTokenIds()
    }
  }, [account, refetchBalance, refetchTokenIds])

  const refetchAll = useCallback(() => {
    refetchBalance()
    refetchTokenIds()
  }, [refetchBalance, refetchTokenIds])

  return {
    tokenIds: useMemo(
      () =>
        !enabled ? [] : (tokenIds.map((r) => (r.status === 'success' ? r.result : null)).filter(Boolean) as bigint[]),
      [tokenIds, enabled],
    ),
    loading: !enabled ? false : someTokenIdsLoading || balanceLoading,
    refetchAll,
  }
}

export function useV3TokenIdsByAccountV2(account?: Address) {
  const { portfolio, mutatePortfolio, isLoading } = usePortfolio({ account }, { paused: !account })

  const positions = useMemo(() => {
    if (!portfolio) return []
    return Object.values(portfolio)
      .filter((pool) => pool.type === 'v3')
      .map((pool) => (pool as PortfolioV3DataBigInt).positions)
      .flat()
  }, [portfolio])

  return {
    tokenIds: positions.filter((p) => p.isStaked).map((p) => p.positionId),
    loading: isLoading,
    mutateTokenIds: mutatePortfolio,
  }
}

export function useV3Positions(account: Address | null | undefined): UseV3PositionsResults {
  const positionManager = useV3NFTPositionManagerContract()
  const masterchefV3 = useMasterchefV3()

  const { tokenIds, loading: tokenIdsLoading } = useV3TokenIdsByAccount(positionManager?.address, account)

  const { tokenIds: stakedTokenIds } = useV3TokenIdsByAccount(masterchefV3?.address, account)

  const totalTokenIds = useMemo(() => [...stakedTokenIds, ...tokenIds], [stakedTokenIds, tokenIds])

  const { positions, loading: positionsLoading, refetch } = useV3PositionsFromTokenIds(totalTokenIds)

  return useMemo(
    () => ({
      loading: tokenIdsLoading || positionsLoading,
      refetch,
      positions: positions?.map((position) => ({
        ...position,
        isStaked: Boolean(stakedTokenIds?.find((s) => s === position.tokenId)),
      })),
    }),
    [positions, positionsLoading, stakedTokenIds, tokenIdsLoading],
  )
}
