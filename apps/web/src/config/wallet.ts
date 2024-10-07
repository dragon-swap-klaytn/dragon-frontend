import { WalletConfigV2 } from '@pancakeswap/ui-wallets'
import { WalletFilledIcon } from '@pancakeswap/uikit'
import KaikasIcon from 'components/Svg/KaikasIcon'
import type { ExtendEthereum } from 'global'
import { klipConnector, walletConnectNoQrCodeConnector } from '../utils/wagmi'

export enum ConnectorNames {
  Kaikas = 'kaikas',
  Klip = 'klip',
  MetaMask = 'metaMask',
  Injected = 'injected',
  WalletConnect = 'walletConnect',
  WalletConnectV1 = 'walletConnectLegacy',
  BSC = 'bsc',
  BinanceW3W = 'BinanceW3W',
  Blocto = 'blocto',
  WalletLink = 'coinbaseWallet',
  Ledger = 'ledger',
  TrustWallet = 'trustWallet',
  CyberWallet = 'cyberwallet',
}

const createQrCode = (chainId: number, connect) => async () => {
  connect({ connector: walletConnectNoQrCodeConnector, chainId })

  const r = await walletConnectNoQrCodeConnector.getProvider()
  return new Promise<string>((resolve) => {
    r.on('display_uri', (uri) => {
      resolve(uri)
    })
  })
}

const createQrCodeForA2A = (chainId: number, connect, type) => async () => {
  connect({ connector: klipConnector, chainId })

  const r = await klipConnector.getProvider()
  return new Promise<string>((resolve) => {
    r.on('display_uri', (uri) => {
      resolve(uri)
    })
  })
}

const isMetamaskInstalled = () => {
  if (typeof window === 'undefined') {
    return false
  }

  if (window.ethereum?.isMetaMask) {
    return true
  }

  if (window.ethereum?.providers?.some((p) => p.isMetaMask)) {
    return true
  }

  return false
}

function isBinanceWeb3WalletInstalled() {
  return typeof window !== 'undefined' && Boolean((window.ethereum as ExtendEthereum)?.isBinance)
}

const walletsConfig = ({
  chainId,
  connect,
}: {
  chainId: number
  connect: (connectorID: ConnectorNames) => void
}): WalletConfigV2<ConnectorNames>[] => {
  const qrCode = createQrCode(chainId, connect)
  return [
    {
      id: 'klip',
      title: 'Klip',
      icon: '/images/wallets/klip.png',
      connectorId: ConnectorNames.Klip,
      get installed() {
        return false
      },
      qrCode: createQrCodeForA2A(chainId, connect, 'klip'),
    },
    {
      id: 'Kaikas',
      title: 'KaiaWallet',
      icon: KaikasIcon,
      connectorId: ConnectorNames.Kaikas,
    },
    {
      id: 'metamask',
      title: 'Metamask',
      icon: `/images/wallets/metamask.png`,
      get installed() {
        return isMetamaskInstalled()
        // && metaMaskConnector.ready
      },
      connectorId: ConnectorNames.MetaMask,
      downloadLink: 'https://metamask.app.link/dapp/dgswap.io',
      deepLink: 'https://metamask.app.link/dapp/dgswap.io',
    },
    {
      id: 'tokenpocket',
      title: 'TokenPocket',
      icon: `/images/wallets/tokenpocket.png`,
      connectorId: ConnectorNames.Injected,
      get installed() {
        return typeof window !== 'undefined' && Boolean(window.ethereum?.isTokenPocket)
      },
      qrCode,
    },
    ...(process.env.NEXT_PUBLIC_WALLET_CONNECT_ID
      ? [
          {
            id: 'walletconnect',
            title: 'WalletConnect',
            icon: '/images/wallets/walletconnect.png',
            connectorId: ConnectorNames.WalletConnect,
          },
        ]
      : []),
  ]
}

export const createWallets = (chainId: number, connect: any) => {
  const hasInjected = typeof window !== 'undefined' && !window.ethereum
  const config = walletsConfig({ chainId, connect })
  return hasInjected && config.some((c) => c.installed && c.connectorId === ConnectorNames.Injected)
    ? config // add injected icon if none of injected type wallets installed
    : [
        ...config,
        {
          id: 'injected',
          title: 'Injected',
          icon: WalletFilledIcon,
          connectorId: ConnectorNames.Injected,
          installed: typeof window !== 'undefined' && Boolean(window.ethereum),
        },
      ]
}

export const getDocLink = (code: string) => {
  if (code !== 'en-US') {
    /* empty */
  }

  return 'https://docs.dgswap.io/getting-started/supported-wallets'
}
