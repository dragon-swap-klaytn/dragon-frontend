import { Currency, Token } from '@pancakeswap/sdk'
import { deserializeToken } from '@pancakeswap/token-lists'
import { createSelector } from '@reduxjs/toolkit'
import { LOCAL_STORAGE_KEYS } from 'defines/local-storage-keys'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { atom, useAtom } from 'jotai'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { UserAddedTokenMap } from 'state/user/reducer'
import { AppState } from '../../index'

const selectUserTokens = ({ user: { tokens } }: AppState) => tokens

export const userAddedTokenSelector = (chainId: number) =>
  createSelector(selectUserTokens, (serializedTokensMap) => {
    return Object.values(serializedTokensMap?.[chainId] ?? {}).map(deserializeToken)
  })
export default function useUserAddedTokens(): Token[] {
  const { chainId } = useActiveChainId()
  return useSelector(useMemo(() => userAddedTokenSelector(chainId), [chainId]))
}

export const userAddedTokenMapAtom = atom<UserAddedTokenMap | null>(null)
export function useUserAddedTokenMapFromLs() {
  const [userAddedTokenMap, _setUserAddedTokenMap] = useAtom(userAddedTokenMapAtom)
  const [isLoading, setIsLoading] = useState(true)

  // FIXME: @kay Update setUserAddedTokenMap type
  const setUserAddedTokenMap = _setUserAddedTokenMap as any

  const refresh = useCallback(() => {
    setIsLoading(true)
    const _useAddedTokenMap = JSON.parse(
      localStorage.getItem(LOCAL_STORAGE_KEYS.userAddedTokenMap) ?? '{}',
    ) as UserAddedTokenMap

    setUserAddedTokenMap(_useAddedTokenMap)
    setIsLoading(false)
  }, [setUserAddedTokenMap])

  useEffect(() => {
    refresh()
  }, [refresh])

  return {
    isLoading,
    userAddedTokenMap,
    setUserAddedTokenMap,
    refresh,
  }
}

export function useUserAddedTokensFromLs() {
  const { userAddedTokenMap, isLoading, refresh } = useUserAddedTokenMapFromLs()

  return { userAddedTokens: userAddedTokenMap ? Object.values(userAddedTokenMap) : [], isLoading, refresh }
}

export function useIsUserAddedTokenFromLs(token: Currency) {
  const { userAddedTokenMap, isLoading } = useUserAddedTokenMapFromLs()

  if (token.isNative)
    return {
      isAdded: false,
      isLoading: false,
    }

  return {
    isAdded: !!userAddedTokenMap?.[token.wrapped.address],
    isLoading,
  }
}
