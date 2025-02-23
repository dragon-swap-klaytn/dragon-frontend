import { VALID_ADDRESS_REGEX } from '@pancakeswap/uikit'
import { CHAINS } from 'config/chains'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { useMemo } from 'react'
import { useEnsAddress } from 'wagmi'

const ENS_SUPPORT_CHAIN_IDS = CHAINS.filter((c) => 'ensUniversalResolver' in c.contracts).map((c) => c.id)

const ENS_NAME_REGEX = /^[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)?$/

export const useGetENSAddressByName = (ensNameOrAddress: string) => {
  const { chainId } = useActiveChainId()
  const ensSupported = useMemo(
    () => Boolean(chainId && ENS_SUPPORT_CHAIN_IDS.includes(chainId as (typeof ENS_SUPPORT_CHAIN_IDS)[number])),
    [chainId],
  )
  const { data: recipientENSAddress } = useEnsAddress({
    name: ensNameOrAddress,
    chainId,
    enabled: (ENS_NAME_REGEX.test(ensNameOrAddress) || VALID_ADDRESS_REGEX.test(ensNameOrAddress)) && ensSupported,
  })
  return recipientENSAddress
}
