import { ChainId } from "@pancakeswap/chains";

export const VALID_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;

export const SUPPORTED_CHAIN_IDS = [ChainId.KLAYTN, ChainId.KLAYTN_TESTNET];
export const DGSWAP_DOMAIN = "https://dgswap.io";

export enum WalletIds {
  kaiaWallet = "kaiawallet",
  klip = "klip",
  metamask = "metamask",
  // injected = 'injected',
  walletConnect = "walletconnect",
  tokenpocket = "tokenpocket",
  okxWallet = "okxwallet",
  dappPortalWallet = "dappportalwallet",
}
export type WalletId = `${WalletIds}`;

export enum ConnectorIds {
  kaiaWallet = "kaiawallet",
  klip = "klip",
  metamask = "metaMask",
  walletConnect = "walletConnect",
  tokenpocket = "tokenpocket",
  okxWallet = "okxwallet",
  dappPortalWallet = "dappportalwallet",
}

export type ConnectorId = `${ConnectorIds}`;
export enum WindowSize {
  mobile = 768,
  xxs = 360,
  xs = 480,
  sm = 640,
}
