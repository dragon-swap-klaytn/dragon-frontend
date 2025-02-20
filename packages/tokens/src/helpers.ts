import { ChainId } from '@pancakeswap/chains'
import { Currency, Native, Token, WNATIVE } from '@pancakeswap/sdk'
import { TokenAddressMap } from '@pancakeswap/token-lists'
import { enumValues } from '@pancakeswap/utils/enumValues'

const createEmptyList = () => {
  const list = {} as Record<ChainId, TokenAddressMap<ChainId>[ChainId]>
  for (const chainId of enumValues(ChainId)) {
    list[chainId] = {}
  }
  return list as TokenAddressMap<ChainId>
}

/**
 * An empty result, useful as a default.
 */
export const EMPTY_LIST: TokenAddressMap<ChainId> = createEmptyList()

export function serializeTokens(unserializedTokens: any) {
  const serializedTokens = Object.keys(unserializedTokens).reduce((accum, key) => {
    return { ...accum, [key]: unserializedTokens[key].serialize }
  }, {} as any)

  return serializedTokens
}

export function unwrappedToken(token?: Token): Currency | undefined {
  if (!token) return undefined

  const wrappedNative = WNATIVE[token.chainId as keyof typeof WNATIVE]
  if (token.equals(wrappedNative)) {
    return Native.onChain(token.chainId)
  }

  return token
}
