import { BigintIsh, Percent } from '@pancakeswap/sdk'

import { lpTokenABI } from 'config/abi/lpTokenAbi'
import { stableSwapABI } from 'config/abi/stableSwapAbi'
import { useEffect } from 'react'
import { useCurrentBlockByMediumInterval } from 'state/block/hooks'
import { Address, useContractReads } from 'wagmi'
import { useActiveChainId } from './useActiveChainId'

export function useStableSwapInfo(stableSwapAddress: Address | undefined, lpAddress: Address | undefined) {
  const { chainId } = useActiveChainId()

  const {
    data: results,
    isLoading,
    refetch,
  } = useContractReads({
    watch: false,
    enabled: Boolean(stableSwapAddress && lpAddress),
    contracts: [
      {
        chainId,
        abi: stableSwapABI,
        address: stableSwapAddress,
        functionName: 'balances',
        args: [0n],
      },
      {
        chainId,
        abi: stableSwapABI,
        address: stableSwapAddress,
        functionName: 'balances',
        args: [1n],
      },
      {
        chainId,
        abi: stableSwapABI,
        address: stableSwapAddress,
        functionName: 'A',
      },
      {
        chainId,
        abi: lpTokenABI,
        address: lpAddress,
        functionName: 'totalSupply',
      },
      {
        chainId,
        abi: stableSwapABI,
        address: stableSwapAddress,
        functionName: 'fee',
      },
      {
        chainId,
        abi: stableSwapABI,
        address: stableSwapAddress,
        functionName: 'FEE_DENOMINATOR',
      },
    ],
  })

  const currentBlock = useCurrentBlockByMediumInterval()
  useEffect(() => {
    if (!currentBlock) return

    refetch()
  }, [currentBlock, chainId, refetch])

  const feeNumerator = results?.[4]?.result
  const feeDenominator = results?.[5]?.result

  return {
    balances: [results?.[0].result, results?.[1].result],
    amplifier: results?.[2].result,
    totalSupply: results?.[3].result,
    fee: feeNumerator && feeDenominator && new Percent(feeNumerator as BigintIsh, feeDenominator as BigintIsh),
    loading: isLoading,
  }
}
