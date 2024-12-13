import { KaiaWalletConnector } from '@pancakeswap/wagmi/connectors/kaiaWallet'
import { KlipConnector } from '@pancakeswap/wagmi/connectors/klip'
import memoize from 'lodash/memoize'
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
        projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_ID,
      },
    })
  : undefined

export const walletConnectNoQrCodeConnector = new WalletConnectConnector({
  chains,
  options: {
    showQrModal: false,
    projectId: '7eb02e7ebd6f7197f9e238e8a0331476',
  },
})
export const metaMaskConnector = new MetaMaskConnector({
  chains,
  options: {
    shimDisconnect: false,
  },
})

const kaiaWalletConnector = new KaiaWalletConnector({ chains })

export const klipConnector = new KlipConnector({
  chains,
  options: {
    chainId: 8217,
    rpc: {
      custom: {
        // 8217: klaytn.rpcUrls.public.http[0],
        8217: 'https://public-en.node.kaia.io',
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
    ...(kaiaWalletConnector ? [kaiaWalletConnector as any] : []),
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
