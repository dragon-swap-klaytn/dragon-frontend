/* eslint-disable no-param-reassign */
import { ChainId, ERC20Token, Token } from '@pancakeswap/sdk'
import { Currency } from '@pancakeswap/swap-sdk-core'

import { TokenAddressMap } from '@pancakeswap/token-lists'
import { VALID_ADDRESS_REGEX, ZERO_ADDRESS } from '@pancakeswap/uikit'
import { TOKEN_MAPPER } from 'const'
import { useMemo } from 'react'
import { useUnsupportedTokenList, useWarningTokenList } from 'state/lists/hooks'
import useSWR from 'swr'
import { safeGetAddress } from 'utils'
import { toChecksumToken } from 'utils/toChecksumToken'
import { Address } from 'viem'
import { useToken as useToken_ } from 'wagmi'
import useUserAddedTokens, { useUserAddedTokensFromLs } from '../state/user/hooks/useUserAddedTokens'
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

export function useTokenMap({ skip = false, poolOnly = false }: { skip?: boolean; poolOnly?: boolean } = {}) {
  const { userAddedTokens } = useUserAddedTokensFromLs()

  const { data: fetchedTokenMap, error } = useSWR(
    !skip ? `/api/tokens/${poolOnly}` : null,
    async () => {
      const params = new URLSearchParams()
      params.append('poolOnly', String(poolOnly))

      const res = await fetch(`/api/tokens?${params.toString()}`)
      const parsed = (await res.json()) as { [address: Address]: Token }

      return Object.values(parsed).reduce(
        (acc, token) => ({
          ...acc,
          [token.address]: new Token(token.chainId, token.address, token.decimals, token.symbol, token.name),
        }),
        {} as { [address: Address]: Token },
      )
    },
    {
      refreshInterval: 1_000 * 60 * 10, // 10 minutes
    },
  )

  const tokenMap = useMemo(() => {
    if (!fetchedTokenMap || !userAddedTokens) return undefined

    return userAddedTokens
      .filter((token) => !fetchedTokenMap[token.address.toLowerCase()])
      .reduce<{ [address: Address]: Token }>(
        (tokenMap_, token) => ({
          ...tokenMap_,
          [token.address]: new Token(token.chainId, token.address, token.decimals, token.symbol, token.name),
        }),
        fetchedTokenMap,
      )
  }, [userAddedTokens, fetchedTokenMap])

  return {
    tokenMap,
    tokenMapLoading: !tokenMap && !error,
  }
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

export function useIsTokenActive(token: Currency | ERC20Token | undefined | null): boolean {
  const { tokenMap: onlyPoolTokenMap } = useTokenMap({ poolOnly: true })

  if (!onlyPoolTokenMap || !token) {
    return false
  }

  if (token.isNative) {
    return true
  }

  // @ts-ignore
  return Boolean(onlyPoolTokenMap[token.address])
}

// Check if currency is included in custom list from user storage
export function useIsUserAddedToken(currency: Currency | undefined | null): boolean {
  const userAddedTokens = useUserAddedTokens()

  if (!currency?.equals) {
    return false
  }

  return !!userAddedTokens.find((token) => currency?.equals(token))
}

export function useTokens(searchKey?: string) {
  const { chainId } = useActiveChainId()
  const { tokenMap, tokenMapLoading } = useTokenMap()
  // const address = safeGetAddress(searchKey)
  const isAddress = useMemo(() => searchKey && VALID_ADDRESS_REGEX.test(searchKey), [searchKey])
  const token = useMemo(
    () => (searchKey && tokenMap ? (tokenMap[searchKey] as Token) : undefined),
    [searchKey, tokenMap],
  )

  const { data, isLoading } = useToken_({
    address: (searchKey as Address) || undefined,
    chainId,
    enabled: Boolean(!!searchKey && isAddress && !token && !tokenMapLoading),
    // consider longer stale time
  })

  return useMemo(() => {
    if (!searchKey) return undefined

    if (!tokenMap) return null
    if (token) return [token]
    if (!chainId) return undefined

    if (searchKey) {
      const filteredTokenMap = new Map<string, Token>()

      if (TOKEN_MAPPER[searchKey.toLowerCase()]) {
        const tokenMapper = TOKEN_MAPPER[searchKey.toLowerCase()]

        tokenMapper.forEach((t) => {
          const address = t.address.toLowerCase()
          if (!filteredTokenMap.has(address)) {
            filteredTokenMap.set(address, t)
          }
        })
      }

      const filteredByAddress = Object.values(tokenMap).filter((t) =>
        t.address.toLowerCase().includes(searchKey.toLowerCase()),
      )
      if (filteredByAddress.length > 0) {
        filteredByAddress.forEach((t) => {
          const address = t.address.toLowerCase()
          if (!filteredTokenMap.has(address)) {
            filteredTokenMap.set(address, t)
          }
        })
      }

      const filteredBySymbol = Object.values(tokenMap).filter((t) =>
        t.symbol.toLowerCase().includes(searchKey.toLowerCase()),
      )
      if (filteredBySymbol.length > 0) {
        filteredBySymbol.forEach((t) => {
          const address = t.address.toLowerCase()
          if (!filteredTokenMap.has(address)) {
            filteredTokenMap.set(address, t)
          }
        })
      }

      const filteredByName = Object.values(tokenMap).filter((t) =>
        t.name?.toLowerCase().includes(searchKey.toLowerCase()),
      )
      if (filteredByName.length > 0) {
        filteredByName.forEach((t) => {
          const address = t.address.toLowerCase()
          if (!filteredTokenMap.has(address)) {
            filteredTokenMap.set(address, t)
          }
        })
      }

      if (filteredTokenMap.size === 0 && data) {
        return [new Token(chainId, data.address, data.decimals, data.symbol ?? 'UNKNOWN', data.name ?? 'Unknown Token')]
      }

      return Array.from(filteredTokenMap.values()).map(
        (t) => new Token(chainId, t.address, t.decimals, t.symbol ?? 'UNKNOWN', t.name ?? 'Unknown Token'),
      )
    }

    if (isAddress && tokenMap[searchKey]) {
      return [tokenMap[searchKey]] as Token[]
    }

    if (isLoading) return null
    if (data) {
      return [new Token(chainId, data.address, data.decimals, data.symbol ?? 'UNKNOWN', data.name ?? 'Unknown Token')]
    }

    return undefined
  }, [token, chainId, isAddress, isLoading, data, tokenMap, searchKey])
}

export function useToken(searchKey = '', { needChecksummed = false } = {}): ERC20Token | undefined | null {
  const tokens = useTokens(searchKey)
  return !needChecksummed ? tokens?.[0] : tokens?.[0] ? toChecksumToken(tokens?.[0]) : undefined
}

export function useCurrency(
  currencyId = '',
  { needChecksummed = false } = {},
): Currency | ERC20Token | null | undefined {
  const native = useNativeCurrency()
  const isNative = useMemo(
    () => currencyId?.toLowerCase() === native.symbol?.toLowerCase() || currencyId === ZERO_ADDRESS,
    [currencyId, native],
  )
  const token = useToken(isNative ? undefined : currencyId, { needChecksummed })
  return isNative ? native : token
}
