import { ConnectorId, SvgProps, WalletId } from '@pancakeswap/uikit'

export type LinkOfTextAndLink = string | { text: string; url: string }

export type DeviceLink = {
  desktop?: LinkOfTextAndLink
  mobile?: LinkOfTextAndLink
}

export type LinkOfDevice = string | DeviceLink

export type WalletConfigV2 = {
  id: WalletId
  title: string
  icon: string | React.FC<React.PropsWithChildren<SvgProps>>
  connectorId: ConnectorId
  deepLink?: string
  installed: boolean
  guide?: LinkOfDevice
  downloadLink?: string
  mobileOnly?: boolean
  qrCode?: () => Promise<string | string[]>
  cancelRequest?: (requestKey: string) => void
  isNotExtension?: boolean
}
