import { ChainId } from "@pancakeswap/chains";

export const VALID_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;

export const SUPPORTED_CHAIN_IDS = [ChainId.KLAYTN, ChainId.KLAYTN_TESTNET];
export const DGSWAP_DOMAIN = "https://dgswap.io";

export enum WalletIds {
  kaiawallet = "kaiawallet",
  klip = "klip",
  metamask = "metamask",
  // injected = 'injected',
  walletconnect = "walletconnect",
  tokenpocket = "tokenpocket",
  okxwallet = "okxwallet",
}
export type WalletId = `${WalletIds}`;

export enum ConnectorIds {
  kaiawallet = "kaiawallet",
  klip = "klip",
  metamask = "metaMask",
  walletconnect = "walletConnect",
  tokenpocket = "tokenpocket",
  okxwallet = "okxwallet",
}

export type ConnectorId = `${ConnectorIds}`;
export enum WindowSize {
  mobile = 768,
}
