import { useMemo } from 'react'

import { L2_CHAIN_IDS } from 'config/chains'
import { L2_DEADLINE_FROM_NOW } from 'config/constants'

import { useUserTxTtl } from '@pancakeswap/utils/user'
import { useActiveChainId } from './useActiveChainId'
import useCurrentBlockTimestamp from './useCurrentBlockTimestamp'

// combines the block timestamp with the user setting to give the deadline that should be used for any submitted transaction
export default function useTransactionDeadline(): bigint | undefined {
  const { chainId } = useActiveChainId()
  const blockTimestamp = useCurrentBlockTimestamp()
  const [ttl] = useUserTxTtl()

  return useMemo(() => {
    if (blockTimestamp && chainId && L2_CHAIN_IDS.includes(chainId))
      return blockTimestamp + BigInt(L2_DEADLINE_FROM_NOW)
    if (blockTimestamp && ttl) return blockTimestamp + BigInt(ttl)
    return undefined
  }, [blockTimestamp, ttl, chainId])
}
