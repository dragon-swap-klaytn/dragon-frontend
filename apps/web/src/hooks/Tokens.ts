/* eslint-disable no-param-reassign */
import { ChainId } from '@pancakeswap/chains'
import { ERC20Token } from '@pancakeswap/sdk'
import { Currency } from '@pancakeswap/swap-sdk-core'

import { TokenAddressMap } from '@pancakeswap/token-lists'
import { SUPPORTED_CHAIN_IDS } from '@pancakeswap/uikit'
import { GELATO_NATIVE } from 'config/constants'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import {
  combinedTokenMapFromActiveUrlsAtom,
  combinedTokenMapFromOfficialsUrlsAtom,
  useUnsupportedTokenList,
  useWarningTokenList,
} from 'state/lists/hooks'
import useSWR from 'swr'
import { safeGetAddress } from 'utils'
import { useToken as useToken_ } from 'wagmi'
import useUserAddedTokens from '../state/user/hooks/useUserAddedTokens'
import { useActiveChainId } from './useActiveChainId'
import useNativeCurrency from './useNativeCurrency'

const mapWithoutUrls = (tokenMap?: TokenAddressMap<ChainId>, chainId?: number) => {
  if (!tokenMap || !chainId) return {}
  return Object.keys(tokenMap[chainId] || {}).reduce<{ [address: string]: ERC20Token }>((newMap, address) => {
    const checksummedAddress = safeGetAddress(address)

    if (checksummedAddress && !newMap[checksummedAddress]) {
      newMap[checksummedAddress] = tokenMap[chainId][address].token
    }

    return newMap
  }, {})
}

/**
 * Returns all tokens that are from active urls and user added tokens
 */
export function useAllTokens(): { [address: string]: ERC20Token } {
  const { chainId } = useActiveChainId()
  const tokenMap = useAtomValue(combinedTokenMapFromActiveUrlsAtom)
  const userAddedTokens = useUserAddedTokens()
  const tokens = useMemo(
    () =>
      userAddedTokens
        // reduce into all ALL_TOKENS filtered by the current chain
        .reduce<{ [address: string]: ERC20Token }>(
          (tokenMap_, token) => {
            const checksummedAddress = safeGetAddress(token.address)

            if (checksummedAddress) {
              tokenMap_[checksummedAddress] = token
            }

            return tokenMap_
          },
          // must make a copy because reduce modifies the map, and we do not
          // want to make a copy in every iteration
          mapWithoutUrls(tokenMap, chainId),
        ),
    [userAddedTokens, tokenMap, chainId],
  )

  return tokens
}

/**
 * Returns all tokens that are from active urls and user added tokens
 */
export function useTokensFromSs(): { [address: string]: ERC20Token } | null {
  const { data } = useSWR(
    '/api/tokens',
    async () => {
      const res = await fetch('/api/tokens')
      const parsed = (await res.json()) as { [address: string]: ERC20Token }

      return parsed
    },
    {
      refreshInterval: 1000 * 60 * 10, // 10 minutes
    },
  )

  return data || {}
}

/**
 * Returns all tokens that are from officials token list and user added tokens
 */
export function useOfficialsAndUserAddedTokens(): { [address: string]: ERC20Token } {
  const { chainId } = useActiveChainId()
  const tokenMap = useAtomValue(combinedTokenMapFromOfficialsUrlsAtom)

  const userAddedTokens = useUserAddedTokens()
  return useMemo(() => {
    return (
      userAddedTokens
        // reduce into all ALL_TOKENS filtered by the current chain
        .reduce<{ [address: string]: ERC20Token }>(
          (tokenMap_, token) => {
            const checksummedAddress = safeGetAddress(token.address)

            if (checksummedAddress) {
              tokenMap_[checksummedAddress] = token
            }

            return tokenMap_
          },
          // must make a copy because reduce modifies the map, and we do not
          // want to make a copy in every iteration
          mapWithoutUrls(tokenMap, chainId),
        )
    )
  }, [userAddedTokens, tokenMap, chainId])
}

export function useUnsupportedTokens(): { [address: string]: ERC20Token } {
  const { chainId } = useActiveChainId()
  const unsupportedTokensMap = useUnsupportedTokenList()
  return useMemo(() => mapWithoutUrls(unsupportedTokensMap, chainId), [unsupportedTokensMap, chainId])
}

export function useWarningTokens(): { [address: string]: ERC20Token } {
  const warningTokensMap = useWarningTokenList()
  const { chainId } = useActiveChainId()
  return useMemo(() => mapWithoutUrls(warningTokensMap, chainId), [warningTokensMap, chainId])
}

export function useIsTokenActive(token: ERC20Token | undefined | null): boolean {
  const activeTokens = useAllTokens()

  if (!activeTokens || !token) {
    return false
  }

  const tokenAddress = safeGetAddress(token.address)

  return Boolean(tokenAddress && !!activeTokens[tokenAddress])
}

// Check if currency is included in custom list from user storage
export function useIsUserAddedToken(currency: Currency | undefined | null): boolean {
  const userAddedTokens = useUserAddedTokens()

  if (!currency?.equals) {
    return false
  }

  return !!userAddedTokens.find((token) => currency?.equals(token))
}

// undefined if invalid or does not exist
// null if loading
// otherwise returns the token
export function useToken(tokenAddress?: string): ERC20Token | undefined | null {
  const { chainId } = useActiveChainId()
  const unsupportedTokens = useUnsupportedTokens()
  const tokens = useAllTokens()

  const address = safeGetAddress(tokenAddress)

  const token: ERC20Token | undefined = address ? tokens[address] : undefined

  const { data, isLoading } = useToken_({
    address: address || undefined,
    chainId,
    enabled: Boolean(!!address && !token),
    // consider longer stale time
  })

  const tokensFromSs = useTokensFromSs()

  return useMemo(() => {
    if (!tokensFromSs) return null
    if (token) return token
    if (!chainId || !address) return undefined
    if (!SUPPORTED_CHAIN_IDS.includes(chainId)) return undefined
    if (unsupportedTokens[address]) return undefined

    if (tokensFromSs[address]) {
      return new ERC20Token(
        chainId,
        tokensFromSs[address].address,
        tokensFromSs[address].decimals,
        tokensFromSs[address].symbol,
        tokensFromSs[address].name,
      )
    }

    if (isLoading) return null
    if (data) {
      return new ERC20Token(
        chainId,
        data.address,
        data.decimals,
        data.symbol ?? 'UNKNOWN',
        data.name ?? 'Unknown Token',
      )
    }

    return undefined
  }, [token, chainId, address, isLoading, data, unsupportedTokens, tokensFromSs])
}

export function useTokens(key?: string): ERC20Token[] | undefined | null {
  const { chainId } = useActiveChainId()
  const unsupportedTokens = useUnsupportedTokens()
  const tokens = useAllTokens()

  const address = safeGetAddress(key)

  const token: ERC20Token | undefined = address ? tokens[address] : undefined

  const { data, isLoading } = useToken_({
    address: address || undefined,
    chainId,
    enabled: Boolean(!!address && !token),
    // consider longer stale time
  })

  const tokensFromSs = useTokensFromSs()

  return useMemo(() => {
    if (!tokensFromSs) return null
    if (token) return [token]
    if (!chainId) return undefined

    if (key) {
      const filteredByAddress = Object.values(tokensFromSs).filter((t) =>
        t.address.toLowerCase().includes(key.toLowerCase()),
      )
      if (filteredByAddress.length > 0) {
        return filteredByAddress.map((t) => new ERC20Token(chainId, t.address, t.decimals, t.symbol, t.name))
      }

      const filteredBySymbol = Object.values(tokensFromSs).filter((t) =>
        t.symbol.toLowerCase().includes(key.toLowerCase()),
      )
      if (filteredBySymbol.length > 0) {
        return filteredBySymbol.map((t) => new ERC20Token(chainId, t.address, t.decimals, t.symbol, t.name))
      }

      const filteredByName = Object.values(tokensFromSs).filter((t) =>
        t.name?.toLowerCase().includes(key.toLowerCase()),
      )
      if (filteredByName.length > 0) {
        return filteredByName.map((t) => new ERC20Token(chainId, t.address, t.decimals, t.symbol, t.name))
      }
    }

    if (!address) return undefined
    if (unsupportedTokens[address]) return undefined

    if (tokensFromSs[address]) {
      return [
        new ERC20Token(
          chainId,
          tokensFromSs[address].address,
          tokensFromSs[address].decimals,
          tokensFromSs[address].symbol,
          tokensFromSs[address].name,
        ),
      ]
    }

    if (isLoading) return null
    if (data) {
      return [
        new ERC20Token(chainId, data.address, data.decimals, data.symbol ?? 'UNKNOWN', data.name ?? 'Unknown Token'),
      ]
    }
    return undefined
  }, [token, chainId, address, isLoading, data, unsupportedTokens, tokensFromSs, key])
}

export function useCurrency(currencyId: string | undefined): Currency | ERC20Token | null | undefined {
  const native = useNativeCurrency()
  const isNative =
    currencyId?.toUpperCase() === native.symbol?.toUpperCase() || currencyId?.toLowerCase() === GELATO_NATIVE
  const token = useToken(isNative ? undefined : currencyId)
  return isNative ? native : token
}
