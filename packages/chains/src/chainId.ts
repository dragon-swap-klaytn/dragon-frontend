// NOTE [체인설정]_1 : enum 설정

export enum ChainId {
  ETHEREUM = 1,
  GOERLI = 5,
  BSC = 56,
  BSC_TESTNET = 97,
  KLAYTN = 8217,
  KLAYTN_TESTNET = 1001,
}

export const testnetChainIds = [
  ChainId.GOERLI,
  ChainId.BSC_TESTNET,
  ChainId.KLAYTN_TESTNET,
]

export const DEFAULT_CHAIN_ID = ChainId.KLAYTN
export const DEFAULT_TESTNET_ID = ChainId.KLAYTN_TESTNET
