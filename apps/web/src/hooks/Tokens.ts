/* eslint-disable no-param-reassign */
import { ChainId } from '@pancakeswap/chains'
import { ERC20Token } from '@pancakeswap/sdk'
import { Currency, NativeCurrency } from '@pancakeswap/swap-sdk-core'

import { TokenAddressMap } from '@pancakeswap/token-lists'
import { ZERO_ADDRESS } from '@pancakeswap/uikit'
import { GELATO_NATIVE } from 'config/constants'
import { useAtomValue } from 'jotai'
import { useEffect, useMemo, useState } from 'react'
import {
  combinedCurrenciesMapFromActiveUrlsAtom,
  combinedTokenMapFromActiveUrlsAtom,
  combinedTokenMapFromOfficialsUrlsAtom,
  useUnsupportedTokenList,
  useWarningTokenList,
} from 'state/lists/hooks'
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

const mapWithoutUrlsBySymbol = (tokenMap?: TokenAddressMap<ChainId>, chainId?: number) => {
  if (!tokenMap || !chainId) return {}
  return Object.keys(tokenMap[chainId] || {}).reduce<{ [symbol: string]: ERC20Token }>((newMap, symbol) => {
    newMap[symbol] = tokenMap[chainId][symbol].token

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

  //   {
  //     "chainId": 8217,
  //     "decimals": 8,
  //     "symbol": "oWBTC",
  //     "name": "Orbit Bridge Klaytn Wrapped BTC",
  //     "isNative": false,
  //     "isToken": true,
  //     "address": "0x16D0e1fBD024c600Ca0380A4C5D57Ee7a2eCBf9c"
  // }
  // {
  //   "address": "0x2b5d75db09af26e53d051155f5eae811db7aef67",
  //   "symbol": "KP",
  //   "name": "KlayPay Token",
  //   "decimals": "18"
  // }

  // return {
  //   ...tokens,
  //   ...(tokensFromSs || {}),
  // }
  return tokens
}

/**
 * Returns all tokens that are from active urls and user added tokens
 */
export function useTokensFromSs(): { [address: string]: ERC20Token } | null {
  const [tokensFromSs, setTokensFromSs] = useState<{ [address: string]: ERC20Token } | null>(null)

  useEffect(() => {
    fetch('https://api.swapscanner.io/v0/tokens')
      .then(
        (res) =>
          res.json() as Promise<{
            [address: string]: {
              address: string
              symbol: string
              name: string
              decimals: number
            }
          }>,
      )
      .then((t) => {
        const parsedTokens = Object.values(t).reduce((acc, token) => {
          if (token.address === ZERO_ADDRESS) return acc

          acc[token.address] = {
            chainId: ChainId.KLAYTN,
            address: token.address as `0x${string}`,
            decimals: +token.decimals,
            symbol: token.symbol,
            name: token.name,
          } as ERC20Token

          return acc
        }, {} as { [address: string]: ERC20Token })

        setTokensFromSs(parsedTokens)
      })
      .catch((e) => {
        console.error('failed to fetch tokens from Ss', e)
        // set tokensFromSs to empty object
        setTokensFromSs({})
      })
  }, [])

  return tokensFromSs
}

export function useAllOnRampTokens(): { [address: string]: Currency } {
  const { chainId } = useActiveChainId()
  const tokenMap = useAtomValue(combinedCurrenciesMapFromActiveUrlsAtom)
  return useMemo(() => {
    return mapWithoutUrlsBySymbol(tokenMap, chainId)
  }, [tokenMap, chainId])
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

  return tokenAddress && !!activeTokens[tokenAddress]
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

  //   {
  //     "chainId": 8217,
  //     "decimals": 8,
  //     "symbol": "oWBTC",
  //     "name": "Orbit Bridge Klaytn Wrapped BTC",
  //     "isNative": false,
  //     "isToken": true,
  //     "address": "0x16D0e1fBD024c600Ca0380A4C5D57Ee7a2eCBf9c"
  // }
  // {
  //   "address": "0x2b5d75db09af26e53d051155f5eae811db7aef67",
  //   "symbol": "KP",
  //   "name": "KlayPay Token",
  //   "decimals": "18"
  // }

  const tokensFromSs = useTokensFromSs()

  return useMemo(() => {
    if (!tokensFromSs) return null
    if (token) return token
    if (!chainId || !address) return undefined
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

  //   {
  //     "chainId": 8217,
  //     "decimals": 8,
  //     "symbol": "oWBTC",
  //     "name": "Orbit Bridge Klaytn Wrapped BTC",
  //     "isNative": false,
  //     "isToken": true,
  //     "address": "0x16D0e1fBD024c600Ca0380A4C5D57Ee7a2eCBf9c"
  // }
  // {
  //   "address": "0x2b5d75db09af26e53d051155f5eae811db7aef67",
  //   "symbol": "KP",
  //   "name": "KlayPay Token",
  //   "decimals": "18"
  // }

  const tokensFromSs = useTokensFromSs()

  return useMemo(() => {
    if (!tokensFromSs) return null
    if (token) return [token]
    if (!chainId) return undefined

    if (key) {
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

export function useOnRampToken(tokenAddress?: string): Currency | undefined {
  const { chainId } = useActiveChainId()
  const tokens = useAllOnRampTokens()
  const address = safeGetAddress(tokenAddress)
  const token = tokens[tokenAddress]

  return useMemo(() => {
    if (token) return token
    if (!chainId || !address) return undefined
    return undefined
  }, [token, chainId, address])
}

export function useCurrency(currencyId: string | undefined): Currency | ERC20Token | null | undefined {
  const native = useNativeCurrency()
  const isNative =
    currencyId?.toUpperCase() === native.symbol?.toUpperCase() || currencyId?.toLowerCase() === GELATO_NATIVE
  const token = useToken(isNative ? undefined : currencyId)
  return isNative ? native : token
}

export function useOnRampCurrency(currencyId: string | undefined): NativeCurrency | Currency | null | undefined {
  const native = useNativeCurrency()
  const isNative =
    currencyId?.toUpperCase() === native.symbol?.toUpperCase() || currencyId?.toLowerCase() === GELATO_NATIVE
  const token = useOnRampToken(currencyId)
  return isNative ? native : token
}
