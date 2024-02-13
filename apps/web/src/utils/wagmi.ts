import { KaikasConnector } from '@pancakeswap/wagmi/connectors/kaikas'
import { KlipConnector } from '@pancakeswap/wagmi/connectors/klip'
import memoize from 'lodash/memoize'
import { klaytn } from 'viem/chains'
import { createConfig, createStorage } from 'wagmi'
import { InjectedConnector } from 'wagmi/connectors/injected'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'
import { chains, publicClient } from './client'

export { chains, publicClient }

export const injectedConnector = new InjectedConnector({
  chains,
  options: {
    shimDisconnect: false,
  },
})

export const walletConnectConnector = process.env.NEXT_PUBLIC_WALLET_CONNECT_ID
  ? new WalletConnectConnector({
      chains,
      options: {
        showQrModal: true,
        projectId: 'e542ff314e26ff34de2d4fba98db70bb',
      },
    })
  : undefined

export const metaMaskConnector = new MetaMaskConnector({
  chains,
  options: {
    shimDisconnect: false,
  },
})

const kaikasConnector = new KaikasConnector({ chains })

export const klipConnector = new KlipConnector({
  chains,
  options: {
    chainId: 8217,
    rpc: {
      custom: {
        8217: klaytn.rpcUrls.public.http[0],
      },
    },
    others: {
      siteName: 'Dragon Swap',
    },
  },
})

export const noopStorage = {
  getItem: (_key: any) => '',
  setItem: (_key: any, _value: any) => null,
  removeItem: (_key: any) => null,
}

export const wagmiConfig = createConfig({
  storage: createStorage({
    storage: typeof window !== 'undefined' ? window.localStorage : noopStorage,
    key: 'dwagmi_v1.1',
  }),
  autoConnect: false,
  publicClient,
  connectors: [
    metaMaskConnector,
    injectedConnector,
    ...(walletConnectConnector ? [walletConnectConnector as any] : []),
    ...(kaikasConnector ? [kaikasConnector as any] : []),
    ...(klipConnector ? [klipConnector as any] : []),
    // @ts-ignore FIXME: wagmi
  ],
})

export const CHAIN_IDS = chains.map((c) => c.id)

export const isChainSupported = memoize((chainId: number) => (CHAIN_IDS as number[]).includes(chainId))
export const isChainTestnet = memoize((chainId: number) => {
  const found = chains.find((c) => c.id === chainId)
  return found ? 'testnet' in found : false
})
