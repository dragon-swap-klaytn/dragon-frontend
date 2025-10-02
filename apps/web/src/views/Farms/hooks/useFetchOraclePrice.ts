import { ChainId } from '@pancakeswap/chains'
import { useEffect } from 'react'
import { useCurrentBlockByMediumInterval } from 'state/block/hooks'
import { getChainlinkOracleContract } from 'utils/contractHelpers'
import { Address, useContractRead } from 'wagmi'

const getOracleAddress = (chainId: number): Address | null => {
  switch (chainId) {
    default:
      return null
  }
}

export const useOraclePrice = (chainId: number) => {
  const tokenAddress = getOracleAddress(chainId)
  const chainlinkOracleContract = getChainlinkOracleContract(tokenAddress || '0x', undefined, ChainId.KLAYTN)
  const { data: price, refetch } = useContractRead({
    abi: chainlinkOracleContract.abi,
    chainId: ChainId.KLAYTN,
    enabled: !!tokenAddress,
    address: tokenAddress || '0x',
    functionName: 'latestAnswer',
    watch: false,
  })

  const currentBlock = useCurrentBlockByMediumInterval()
  useEffect(() => {
    if (!tokenAddress || !currentBlock) return

    refetch()
  }, [currentBlock, tokenAddress, chainId, refetch])

  return price?.toString() ?? '0'
}
