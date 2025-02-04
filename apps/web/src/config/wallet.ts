import { WalletConfigV2 } from '@pancakeswap/ui-wallets'
import { ConnectorId, ConnectorIds, DGSWAP_DOMAIN, WalletId, WalletIds } from '@pancakeswap/uikit'
import { isMobile } from 'react-device-detect'
import { Connector, PublicClient } from 'wagmi'
import { ConnectArgs, ConnectResult } from 'wagmi/dist/actions'
import { klipConnector, walletConnectNoQrCodeConnector } from '../utils/wagmi'

export const DEFAULT_WALLET_ICON = '/images/wallets/default.png'
export function getWalletIcon(id: WalletId): string {
  const icon: { [_id in WalletId]: string } = {
    klip: '/images/wallets/klip.png',
    kaiawallet: '/images/wallets/kaiawallet.png',
    metamask: '/images/wallets/metamask.png',
    tokenpocket: '/images/wallets/tokenpocket.png',
    walletconnect: '/images/wallets/walletconnect.png',
    // injected: DEFAULT_WALLET_ICON,
    okxwallet: '/images/wallets/okxwallet.png',
  }

  return icon[id] || DEFAULT_WALLET_ICON
}

const isMetamaskInstalled = () => {
  if (isMobile) {
    return true
  }

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

export const WALLET_MAP: {
  [id in WalletId]: {
    title: string
    icon: string
    connectorId: ConnectorId
    installed: boolean
    cancelRequest?: (requestKey: string) => void
    downloadLink?: string
    deepLink?: string
  }
} = {
  [WalletIds.kaiawallet]: {
    title: 'KaiaWallet',
    icon: getWalletIcon('kaiawallet'),
    connectorId: ConnectorIds.kaiawallet,
    installed: true,
    downloadLink: 'https://www.kaiawallet.io/',
    deepLink: `https://app.kaikas.io/u/${DGSWAP_DOMAIN}`,
  },
  [WalletIds.klip]: {
    title: 'Klip',
    icon: getWalletIcon('klip'),
    connectorId: ConnectorIds.klip,
    installed: true,
    cancelRequest: async (requestKey: string) => {
      const provider = await klipConnector.getProvider()

      if (provider) {
        provider.cancel(requestKey)
      }
    },
  },
  [WalletIds.metamask]: {
    title: 'MetaMask',
    icon: getWalletIcon('metamask'),
    connectorId: ConnectorIds.metamask,
    installed: isMetamaskInstalled(),
    downloadLink: 'https://metamask.app.link/dapp/dgswap.io',
    deepLink: 'https://metamask.app.link/dapp/dgswap.io',
  },
  // injected: {
  //   title: 'Injected',
  //   icon: getWalletIcon('injected'),
  //   connectorId: 'injected',
  // },
  [WalletIds.walletconnect]: {
    title: 'WalletConnect',
    icon: getWalletIcon('walletconnect'),
    connectorId: ConnectorIds.walletconnect,
    installed: Boolean(process.env.NEXT_PUBLIC_WALLET_CONNECT_ID),
  },
  [WalletIds.tokenpocket]: {
    title: 'TokenPocket',
    icon: getWalletIcon('tokenpocket'),
    connectorId: ConnectorIds.tokenpocket,
    installed: true,
    deepLink: `tpdapp://open?params=${encodeURIComponent(JSON.stringify({ url: DGSWAP_DOMAIN, chain: 'KAIA' }))}`,
    downloadLink: isMobile
      ? 'https://www.tokenpocket.pro/en/download/app'
      : 'https://chromewebstore.google.com/detail/%ED%86%A0%ED%81%B0%ED%8F%AC%EC%BC%93-%EC%9B%B93-nostr-%EC%A7%80%EA%B0%91/mfgccjchihfkkindfppnaooecgfneiii',
  },
  [WalletIds.okxwallet]: {
    title: 'OKX Wallet',
    icon: getWalletIcon('okxwallet'),
    connectorId: ConnectorIds.okxwallet,
    installed: true,
    downloadLink: 'https://chromewebstore.google.com/detail/okx-wallet/mcohilncbfahbmgdjkbpemcciiolgcge',
    deepLink: `https://www.okx.com/download?deeplink=${encodeURIComponent(
      `okx://wallet/dapp/url?dappUrl=${encodeURIComponent(DGSWAP_DOMAIN)}`,
    )}`,
  },
}

export function getConnectorId(id: WalletId): ConnectorId {
  return WALLET_MAP[id].connectorId
}

export function getWalletIdByConnectorId(id: ConnectorId): WalletId {
  return Object.keys(WALLET_MAP).find((key) => WALLET_MAP[key as WalletId].connectorId === id) as WalletId
}

export function getWalletIconByConnectorId(id: ConnectorId): string {
  return getWalletIcon(getWalletIdByConnectorId(id))
}

const createQrCode =
  (chainId: number, connect: (args?: Partial<ConnectArgs>) => Promise<ConnectResult<PublicClient>>) => async () => {
    connect({ connector: walletConnectNoQrCodeConnector, chainId })
      .then((res) => {
        walletConnectNoQrCodeConnector.emit('connect', res)
      })
      .catch((e) => {
        console.error('connect error', e)
        walletConnectNoQrCodeConnector.emit('error', e)
      })

    const r = await walletConnectNoQrCodeConnector.getProvider()
    return new Promise<string>((resolve) => {
      r.on('display_uri', (uri) => {
        resolve(uri)
      })
    })
  }

const createQrCodeForA2A =
  (chainId: number, connect: (args?: Partial<ConnectArgs>) => Promise<ConnectResult<PublicClient>>) => async () => {
    connect({ connector: klipConnector as Connector<any, any>, chainId }).catch((e) => {
      console.error('connect error', e)
    })

    const r = await klipConnector.getProvider()

    let requestKey = ''
    let uri = ''

    return new Promise<string[]>((resolve) => {
      r.on('display_uri', (_uri) => {
        uri = _uri
        if (uri && requestKey) {
          resolve([uri, requestKey])
        }
      })
      r.on('requestKey', (_requestKey) => {
        requestKey = _requestKey
        if (uri && requestKey) {
          resolve([uri, requestKey])
        }
      })
    })
  }

function getQrCode(
  chainId: number,
  connect: (args?: Partial<ConnectArgs>) => Promise<ConnectResult<PublicClient>>,
  id: WalletId,
) {
  return {
    klip: createQrCodeForA2A(chainId, connect),
    tokenpocket: createQrCode(chainId, connect),
    okxwallet: createQrCode(chainId, connect),
  }[id]
}

const walletsConfig = ({
  chainId,
  connect,
}: {
  chainId: number
  connect: (args?: Partial<ConnectArgs>) => Promise<ConnectResult<PublicClient>>
}): WalletConfigV2[] => {
  return [
    ...Object.entries(WALLET_MAP)
      .filter(
        ([id]) =>
          (id === 'walletconnect' && Boolean(process.env.NEXT_PUBLIC_WALLET_CONNECT_ID)) || id !== 'walletconnect',
      )
      .map(([id, config]) => ({
        ...config,
        id: id as WalletId,
        qrCode: getQrCode(chainId, connect, id as WalletId),
      })),
  ]
}

export const createWallets = (
  chainId: number,
  connect: (args?: Partial<ConnectArgs>) => Promise<ConnectResult<PublicClient>>,
) => {
  const config = walletsConfig({ chainId, connect })

  return config
}

export const getDocLink = (code: string) => {
  if (code !== 'en-US') {
    /* empty */
  }

  return 'https://docs.dgswap.io/getting-started/supported-wallets'
}
