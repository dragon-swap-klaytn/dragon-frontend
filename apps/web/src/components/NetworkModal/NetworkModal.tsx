import { ChainId } from '@pancakeswap/chains'
import { ModalV2 } from '@pancakeswap/uikit'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import { atom, useAtom } from 'jotai'
import dynamic from 'next/dynamic'
import { useMemo } from 'react'
import { CHAIN_IDS } from 'utils/wagmi'
import { useNetwork } from 'wagmi'

export const hideWrongNetworkModalAtom = atom(false)

const WrongNetworkModal = dynamic(() => import('./WrongNetworkModal').then((mod) => mod.WrongNetworkModal), {
  ssr: false,
})
const UnsupportedNetworkModal = dynamic(
  () => import('./UnsupportedNetworkModal').then((mod) => mod.UnsupportedNetworkModal),
  { ssr: false },
)

export const NetworkModal = ({
  pageSupportedChains = [ChainId.KLAYTN, ChainId.KLAYTN_TESTNET],
}: {
  pageSupportedChains?: ChainId[]
}) => {
  const { chainId, chain, isWrongNetwork } = useActiveWeb3React()
  const { chains } = useNetwork()
  const [dismissWrongNetwork, setDismissWrongNetwork] = useAtom(hideWrongNetworkModalAtom)

  const isPageNotSupported = useMemo(
    () => Boolean(pageSupportedChains.length) && !pageSupportedChains.includes(chainId),
    [chainId, pageSupportedChains],
  )
  if (pageSupportedChains?.length === 0) return null // open to all chains

  if (isWrongNetwork && !dismissWrongNetwork && !isPageNotSupported) {
    const currentChain = chains.find((c) => c.id === chainId)
    if (!currentChain) return null
    return (
      <ModalV2 isOpen={isWrongNetwork} closeOnOverlayClick onDismiss={() => setDismissWrongNetwork(true)}>
        <WrongNetworkModal currentChain={currentChain} onDismiss={() => setDismissWrongNetwork(true)} />
      </ModalV2>
    )
  }

  if ((chain?.unsupported ?? false) || isPageNotSupported) {
    return (
      <ModalV2 isOpen closeOnOverlayClick={false}>
        <UnsupportedNetworkModal pageSupportedChains={pageSupportedChains?.length ? pageSupportedChains : CHAIN_IDS} />
      </ModalV2>
    )
  }

  return null
}
