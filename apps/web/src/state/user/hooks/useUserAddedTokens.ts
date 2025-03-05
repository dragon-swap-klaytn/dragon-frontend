import { Currency, Token } from '@pancakeswap/sdk'
import { deserializeToken, SerializedWrappedToken } from '@pancakeswap/token-lists'
import { createSelector } from '@reduxjs/toolkit'
import { LOCAL_STORAGE_KEYS } from 'defines/local-storage-keys'
import { useActiveChainId } from 'hooks/useActiveChainId'
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

export function useUserAddedTokenMapFromLs() {
  const [userAddedTokenMap, setUserAddedTokenMap] = useState<UserAddedTokenMap | null>(null)
  useEffect(() => {
    const _useAddedTokenMap = JSON.parse(
      localStorage.getItem(LOCAL_STORAGE_KEYS.userAddedTokenMap) ?? '{}',
    ) as UserAddedTokenMap

    setUserAddedTokenMap(_useAddedTokenMap)
  }, [])

  return userAddedTokenMap
}

export function useUserAddedTokensFromLs() {
  const [userAddedTokens, setUserAddedTokens] = useState<SerializedWrappedToken[]>([])

  const refresh = useCallback(() => {
    const _userAddedTokenMap = JSON.parse(
      localStorage.getItem(LOCAL_STORAGE_KEYS.userAddedTokenMap) ?? '{}',
    ) as UserAddedTokenMap

    setUserAddedTokens(Object.values(_userAddedTokenMap))
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { userAddedTokens, refresh }
}

export function useIsUserAddedTokenFromLs(token: Currency) {
  const [userAddedTokenMap, setUserAddedTokenMap] = useState<UserAddedTokenMap | null>(null)
  useEffect(() => {
    const _useAddedTokenMap = JSON.parse(
      localStorage.getItem(LOCAL_STORAGE_KEYS.userAddedTokenMap) ?? '{}',
    ) as UserAddedTokenMap

    setUserAddedTokenMap(_useAddedTokenMap)
  }, [])

  return useMemo(() => {
    if (token.isNative || !userAddedTokenMap) return false

    return !!userAddedTokenMap[token.wrapped.address.toLowerCase()]
  }, [userAddedTokenMap])
}
