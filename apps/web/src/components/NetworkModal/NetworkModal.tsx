import { ChainId } from '@pancakeswap/chains'
import { useModal } from '@pancakeswap/uikit'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import { atom, useAtom } from 'jotai'
import dynamic from 'next/dynamic'
import { useEffect, useMemo } from 'react'
import { CHAIN_IDS } from 'utils/wagmi'
import { useAccount, useNetwork } from 'wagmi'

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
  const { isConnected } = useAccount()

  const isPageNotSupported = useMemo(
    () => pageSupportedChains.length > 0 && !pageSupportedChains.includes(chainId),
    [chainId, pageSupportedChains],
  )

  const currentChain = useMemo(() => chains.find((c) => c.id === chainId), [chains, chainId])
  const [onPresentWrongNetworkModal, onDismissWrongNetworkModal] = useModal(
    <WrongNetworkModal currentChain={currentChain} onDismiss={() => setDismissWrongNetwork(true)} />,
    true,
    false,
    'wrongNetworkModal',
  )
  const [onPresentUnsupportedNetworkModal, onDismissUnsupportedNetworkModal] = useModal(
    <UnsupportedNetworkModal pageSupportedChains={pageSupportedChains?.length ? pageSupportedChains : CHAIN_IDS} />,
    true,
    false,
    'unsupportedNetworkModal',
  )

  useEffect(() => {
    if (!isConnected || !isWrongNetwork) {
      onDismissWrongNetworkModal()
      onDismissUnsupportedNetworkModal()
      return
    }

    if (isWrongNetwork && !dismissWrongNetwork && !isPageNotSupported) {
      onPresentWrongNetworkModal()
      return
    }

    if ((chain?.unsupported ?? false) || isPageNotSupported) {
      onPresentUnsupportedNetworkModal()
    }
  }, [
    isWrongNetwork,
    dismissWrongNetwork,
    isPageNotSupported,
    onPresentWrongNetworkModal,
    isConnected,
    chain,
    onPresentUnsupportedNetworkModal,
    onDismissWrongNetworkModal,
    onDismissUnsupportedNetworkModal,
  ])

  return null
}
