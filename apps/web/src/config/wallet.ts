import { WalletConfigV2 } from '@pancakeswap/ui-wallets'
import { Connector, PublicClient } from 'wagmi'
import { ConnectArgs, ConnectResult } from 'wagmi/dist/actions'
import { klipConnector, walletConnectNoQrCodeConnector } from '../utils/wagmi'

export enum WalletIds {
  kaiawallet = 'kaiawallet',
  klip = 'klip',
  metamask = 'metamask',
  injected = 'injected',
  walletconnect = 'walletconnect',
  tokenpocket = 'tokenpocket',
}
export type WalletId = `${WalletIds}`
// export const CONNECTOR_IDS = [
//   WalletIds.kaiawallet,
//   WalletIds.klip,
//   WalletIds.metamask,
//   WalletIds.injected,
//   WalletIds.walletconnect,
//   WalletIds.tokenpocket,
// ] as WalletId[]

export const DEFAULT_WALLET_ICON = '/images/wallets/default.png'
export function getWalletIcon(id: WalletId): string {
  const icon: { [_id in WalletId]: string } = {
    klip: '/images/wallets/klip.png',
    kaiawallet: '/images/wallets/kaiawallet.png',
    metamask: '/images/wallets/metamask.png',
    tokenpocket: '/images/wallets/tokenpocket.png',
    walletconnect: '/images/wallets/walletconnect.png',
    injected: DEFAULT_WALLET_ICON,
  }

  return icon[id] || DEFAULT_WALLET_ICON
}

export type ConnectorId = 'kaiawallet' | 'klip' | 'metaMask' | 'injected' | 'walletConnect'

export const WALLET_MAP: {
  [id in WalletId]: {
    name: string
    icon: string
    connectorId?: ConnectorId
  }
} = {
  kaiawallet: {
    name: 'KaiaWallet',
    icon: getWalletIcon('kaiawallet'),
    connectorId: 'kaiawallet',
  },
  klip: {
    name: 'Klip',
    icon: getWalletIcon('klip'),
    connectorId: 'klip',
  },
  metamask: {
    name: 'MetaMask',
    icon: getWalletIcon('metamask'),
    connectorId: 'metaMask',
  },
  injected: {
    name: 'Injected',
    icon: getWalletIcon('injected'),
    connectorId: 'injected',
  },
  walletconnect: {
    name: 'WalletConnect',
    icon: getWalletIcon('walletconnect'),
    connectorId: 'walletConnect',
  },
  tokenpocket: {
    name: 'TokenPocket',
    icon: getWalletIcon('tokenpocket'),
  },
}

export function getConnectorId(id: WalletId): ConnectorId | undefined {
  return WALLET_MAP[id].connectorId
}

export function getWalletIdByConnectorId(id: ConnectorId): WalletId {
  return Object.keys(WALLET_MAP).find((key) => WALLET_MAP[key as WalletId].connectorId === id) as WalletId
}

export function getWalletIconByConnectorId(id: ConnectorId): string {
  return getWalletIcon(getWalletIdByConnectorId(id))
}
// export enum ConnectorNames {
//   Kaikas = 'kaikas',
//   Klip = 'klip',
//   MetaMask = 'metaMask',
//   Injected = 'injected',
//   WalletConnect = 'walletConnect',
//   WalletConnectV1 = 'walletConnectLegacy',
//   BSC = 'bsc',
//   BinanceW3W = 'BinanceW3W',
//   Blocto = 'blocto',
//   WalletLink = 'coinbaseWallet',
//   Ledger = 'ledger',
//   TrustWallet = 'trustWallet',
//   CyberWallet = 'cyberwallet',
// }

// console.log('__wagmiConfig1', wagmiConfig1)

// export type WalletId = keyof typeof ConnectorNames
// export const connectorIds = Object.keys(ConnectorNames) as WalletId[]

const createQrCode =
  (chainId: number, connect: (args?: Partial<ConnectArgs>) => Promise<ConnectResult<PublicClient>>) => async () => {
    console.log('__createQrCode_1', walletConnectNoQrCodeConnector)
    connect({ connector: walletConnectNoQrCodeConnector, chainId })

    const r = await walletConnectNoQrCodeConnector.getProvider()
    return new Promise<string>((resolve) => {
      r.on('display_uri', (uri) => {
        resolve(uri)
      })
    })
  }

const createQrCodeForA2A =
  (chainId: number, connect: (args?: Partial<ConnectArgs>) => Promise<ConnectResult<PublicClient>>) => async () => {
    console.log('__createQrCodeForA2A_1', klipConnector, chainId)
    await connect({ connector: klipConnector as Connector<any, any>, chainId })
    console.log('__createQrCodeForA2A_2')

    const r = await klipConnector.getProvider()
    console.log('__createQrCodeForA2A_3', r)

    return new Promise<string>((resolve) => {
      r.on('display_uri', (uri) => {
        console.log('__createQrCodeForA2A_3', uri)
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

function getQrCode(
  chainId: number,
  connect: (args?: Partial<ConnectArgs>) => Promise<ConnectResult<PublicClient>>,
  id: WalletId,
) {
  return {
    klip: createQrCodeForA2A(chainId, connect),
    tokenpocket: createQrCode(chainId, connect),
  }[id]
}

const walletsConfig = ({
  chainId,
  connect,
}: {
  chainId: number
  connect: (args?: Partial<ConnectArgs>) => Promise<ConnectResult<PublicClient>>
}): WalletConfigV2<WalletId>[] => {
  // const qrCode = createQrCode(chainId, connect)
  return [
    ...Object.entries(WALLET_MAP)
      .filter(([id]) => id !== 'injected' && id !== 'walletconnect')
      .map(([id, { name, icon }]) => ({
        id: id as WalletId,
        title: name,
        icon,
        connectorId: getConnectorId(id as WalletId) as any,
        ...(['klip', 'metamask', 'tokenpocket'].includes(id)
          ? {
              installed: {
                klip: false,
                metamask: isMetamaskInstalled(),
                tokenpocket: typeof window !== 'undefined' && Boolean(window.ethereum?.isTokenPocket),
              }[id],
            }
          : {}),
        ...(['klip', 'tokenpocket'].includes(id) ? { qrCode: getQrCode(chainId, connect, id as WalletId) } : {}),
        ...(['metamask'].includes(id)
          ? {
              downloadLink: 'https://metamask.app.link/dapp/dgswap.io',
              deepLink: 'https://metamask.app.link/dapp/dgswap.io',
            }
          : {}),
      })),

    ...(process.env.NEXT_PUBLIC_WALLET_CONNECT_ID
      ? [
          {
            id: WalletIds.walletconnect,
            // title: 'WalletConnect',
            title: WALLET_MAP[WalletIds.walletconnect].name,
            icon: getWalletIcon('walletconnect'),
            connectorId: WALLET_MAP[WalletIds.walletconnect].connectorId,
          },
        ]
      : []),
  ]

  // [
  //   {
  //     id: 'klip',
  //     title: 'Klip',
  //     icon: getWalletIcon('klip'),
  //     connectorId: ConnectorNames.klip,
  //     get installed() {
  //       return false
  //     },
  //     qrCode: createQrCodeForA2A(chainId, connect, 'klip'),
  //   },
  //   {
  //     id: 'Kaikas',
  //     title: 'KaiaWallet',
  //     icon: getWalletIcon('kaiawallet'),
  //     connectorId: ConnectorNames.kaiawallet,
  //   },
  //   {
  //     id: 'metamask',
  //     title: 'Metamask',
  //     icon: getWalletIcon('metamask'),
  //     get installed() {
  //       return isMetamaskInstalled()
  //       // && metaMaskConnector.ready
  //     },
  //     connectorId: ConnectorNames.metamask,
  //     downloadLink: 'https://metamask.app.link/dapp/dgswap.io',
  //     deepLink: 'https://metamask.app.link/dapp/dgswap.io',
  //   },
  //   {
  //     id: 'tokenpocket',
  //     title: 'TokenPocket',
  //     icon: getWalletIcon('tokenpocket'),
  //     connectorId: ConnectorNames.injected,
  //     get installed() {
  //       return typeof window !== 'undefined' && Boolean(window.ethereum?.isTokenPocket)
  //     },
  //     qrCode,
  //   },
  // ...(process.env.NEXT_PUBLIC_WALLET_CONNECT_ID
  //   ? [
  //       {
  //         id: 'walletconnect',
  //         title: 'WalletConnect',
  //         icon: getWalletIcon('walletconnect'),
  //         connectorId: ConnectorNames.walletconnect,
  //       },
  //     ]
  //   : []),
  // ]
}

export const createWallets = (
  chainId: number,
  connect: (args?: Partial<ConnectArgs>) => Promise<ConnectResult<PublicClient>>,
) => {
  const hasInjected = typeof window !== 'undefined' && !window.ethereum
  const config = walletsConfig({ chainId, connect })
  console.log('__config', config)

  return hasInjected && config.some((c) => c.installed && c.id === 'injected')
    ? config // add injected icon if none of injected type wallets installed
    : [
        ...config,
        {
          id: WalletIds.injected,
          title: WALLET_MAP[WalletIds.injected].name,
          icon: WALLET_MAP[WalletIds.injected].icon,
          // icon: WalletFilledIcon,
          connectorId: WALLET_MAP[WalletIds.injected].connectorId,
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
