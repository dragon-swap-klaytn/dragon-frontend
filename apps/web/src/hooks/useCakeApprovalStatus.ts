import BigNumber from 'bignumber.js'
import { useEffect, useMemo } from 'react'
import { useCurrentBlockByMediumInterval } from 'state/block/hooks'
import { getCakeContract } from 'utils/contractHelpers'
import { useAccount, useContractRead } from 'wagmi'
import { useActiveChainId } from './useActiveChainId'

export const useCakeApprovalStatus = (spender) => {
  const { address: account } = useAccount()
  const { chainId } = useActiveChainId()

  const { data, refetch } = useContractRead({
    chainId,
    ...getCakeContract(chainId),
    enabled: Boolean(account && spender),
    functionName: 'allowance',
    args: [account || '0x', spender],
    watch: false,
    staleTime: Infinity,
  })

  const currentBlock = useCurrentBlockByMediumInterval()
  useEffect(() => {
    if (!account || !currentBlock) return

    refetch()
  }, [currentBlock, account, chainId, refetch])

  return useMemo(
    () => ({
      isVaultApproved: data || 0n > 0,
      allowance: new BigNumber((data || 0n)?.toString()),
      setLastUpdated: refetch,
    }),
    [data, refetch],
  )
}

export default useCakeApprovalStatus
