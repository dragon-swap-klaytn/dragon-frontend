import { ChainId } from '@pancakeswap/chains'
import { useModal } from '@pancakeswap/uikit'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import { atom, useAtom } from 'jotai'
import dynamic from 'next/dynamic'
import { useEffect } from 'react'
import { useAccount } from 'wagmi'

export const hideWrongNetworkModalAtom = atom(false)

const WrongNetworkModal = dynamic(() => import('./WrongNetworkModal').then((mod) => mod.WrongNetworkModal), {
  ssr: false,
})

export const NetworkModal = () => {
  const { chainId, chain, isWrongNetwork } = useActiveWeb3React()
  const [dismissWrongNetwork, setDismissWrongNetwork] = useAtom(hideWrongNetworkModalAtom)
  const { isConnected } = useAccount()

  const isPageNotSupported = chainId !== ChainId.KLAYTN

  const [onPresentWrongNetworkModal, onDismissWrongNetworkModal] = useModal(
    <WrongNetworkModal onDismiss={() => setDismissWrongNetwork(true)} />,
    false,
    false,
    'wrongNetworkModal',
  )

  useEffect(() => {
    if (!isConnected) {
      onDismissWrongNetworkModal()
      return
    }

    if (isPageNotSupported) {
      onPresentWrongNetworkModal()
      return
    }

    if (!isConnected || !isWrongNetwork) {
      onDismissWrongNetworkModal()
      return
    }

    if (isWrongNetwork && !dismissWrongNetwork && !isPageNotSupported) {
      onPresentWrongNetworkModal()
    }
  }, [
    isWrongNetwork,
    dismissWrongNetwork,
    isPageNotSupported,
    onPresentWrongNetworkModal,
    isConnected,
    chain,
    onDismissWrongNetworkModal,
  ])

  return null
}
