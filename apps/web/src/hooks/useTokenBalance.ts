import { ChainId, DEFAULT_CHAIN_ID } from '@pancakeswap/chains'
import { BIG_ZERO } from '@pancakeswap/utils/bigNumber'
import BigNumber from 'bignumber.js'
import { useEffect, useMemo } from 'react'
import { useCurrentBlockByMediumInterval } from 'state/block/hooks'
import { getVeCakeAddress } from 'utils/addressHelpers'
import { Address, erc20ABI, useAccount, useBalance, useContractRead } from 'wagmi'
import { useActiveChainId } from './useActiveChainId'

const useTokenBalance = (tokenAddress: Address, forceDefault?: boolean) => {
  return useTokenBalanceByChain(tokenAddress, forceDefault ? DEFAULT_CHAIN_ID : undefined)
}

export const useTokenBalanceByChain = (tokenAddress: Address, chainIdOverride?: ChainId) => {
  const { address: account } = useAccount()
  const { chainId } = useActiveChainId()

  const { data, status, refetch, ...rest } = useContractRead({
    chainId: chainIdOverride || chainId,
    abi: erc20ABI,
    address: tokenAddress,
    functionName: 'balanceOf',
    args: [account || '0x'],
    enabled: !!account && !!tokenAddress,
    watch: false,
    staleTime: Infinity,
  })

  const currentBlock = useCurrentBlockByMediumInterval()
  useEffect(() => {
    if (!account || !currentBlock) return

    refetch()
  }, [currentBlock, account, chainId, refetch, tokenAddress])

  return {
    ...rest,
    refetch,
    fetchStatus: status,
    balance: useMemo(() => (typeof data !== 'undefined' ? new BigNumber(data.toString()) : BIG_ZERO), [data]),
  }
}

export const useGetNativeTokenBalance = () => {
  const { address: account } = useAccount()
  const { chainId } = useActiveChainId()
  const { status, refetch, data } = useBalance({
    chainId,
    address: account,
    watch: false,
    staleTime: Infinity,
    enabled: !!account,
  })

  const currentBlock = useCurrentBlockByMediumInterval()
  useEffect(() => {
    if (!account || !currentBlock) return

    refetch()
  }, [currentBlock, account, chainId, refetch])

  return { balance: data?.value ? BigInt(data.value) : 0n, fetchStatus: status, refresh: refetch }
}
export const useVeCakeBalance = () => {
  const { chainId } = useActiveChainId()
  const { balance, fetchStatus } = useTokenBalance(getVeCakeAddress(chainId))

  return { balance, fetchStatus }
}

export default useTokenBalance
