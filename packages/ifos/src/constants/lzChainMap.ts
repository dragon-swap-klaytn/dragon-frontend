import { ChainId } from '@pancakeswap/chains'

// @see https://layerzero.gitbook.io/docs/technical-reference/mainnet/supported-chain-ids
export const LZ_CHAIN_MAP = {} as const

export const LZ_MAP_REVERSE = Object.keys(LZ_CHAIN_MAP).reduce<Record<number, ChainId>>(
  (acc, cur) => ({
    ...acc,
    [(LZ_CHAIN_MAP as Record<string, number>)[cur]]: Number(cur) as ChainId,
  }),
  {},
)
