// NOTE [체인설정]_1 : enum 설정

export enum ChainId {
  KLAYTN = 8217,
  KLAYTN_TESTNET = 1001,
}

export const testnetChainIds = [ChainId.KLAYTN_TESTNET]

export const DEFAULT_CHAIN_ID = ChainId.KLAYTN
export const DEFAULT_TESTNET_ID = ChainId.KLAYTN_TESTNET
