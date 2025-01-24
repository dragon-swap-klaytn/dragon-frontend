import { ChainId } from "@pancakeswap/chains";

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
