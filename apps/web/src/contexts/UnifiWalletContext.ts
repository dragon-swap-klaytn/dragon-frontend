import { atom, useAtom } from 'jotai'
import { useCallback, useEffect, useMemo, useRef } from 'react'

import { CurrencyAmount, Token } from '@pancakeswap/swap-sdk-core'
import { JPYC_TOKEN, TETHER_TOKEN } from 'const'
import { useAccount } from 'wagmi'

const cachedUnifiWalletTokenBalancesAtom = atom<{
  [address: string]: {
    [tokenAddress: string]: string
  }
}>({})
export const refreshUnifiWalletManagedTokenBalancesAtom = atom<{ fn: () => void }>({ fn: () => {} })
export const refreshUnifiWalletUSDTBalanceAtom = refreshUnifiWalletManagedTokenBalancesAtom
export const unifiWalletProviderAtom = atom(null as any)

const UNIFI_MANAGED_TOKENS = [TETHER_TOKEN, JPYC_TOKEN] as const
const UNIFI_MANAGED_TOKEN_ADDRESS_SET = new Set(UNIFI_MANAGED_TOKENS.map((token) => token.address.toLowerCase()))

export function isUnifiWalletManagedTokenAddress(address?: string | null) {
  return Boolean(address && UNIFI_MANAGED_TOKEN_ADDRESS_SET.has(address.toLowerCase()))
}

export function useUnifiWalletManagedTokenBalancesSync() {
  const { connector, address: account } = useAccount()

  const [, setCachedUnifiWalletTokenBalances] = useAtom(cachedUnifiWalletTokenBalancesAtom)
  const [, setRefreshUnifiWalletManagedTokenBalances] = useAtom(refreshUnifiWalletManagedTokenBalancesAtom)
  const [, setUnifiWalletConnector] = useAtom(unifiWalletProviderAtom)

  useEffect(() => {
    if (!connector || connector.id !== 'unifiwallet') {
      setUnifiWalletConnector(null)
      return
    }

    const unifiConnector =
      connector as unknown as import('@pancakeswap/wagmi/connectors/dappPortalWallet').UnifiWalletConnector
    if (!unifiConnector) return

    unifiConnector
      .getProvider()
      .then((provider) => setUnifiWalletConnector(provider))
      .catch((error) => {
        console.error('Failed to get UniFi Wallet provider:', error)
      })
  }, [connector, setUnifiWalletConnector])

  const pendingUnifiWalletTokenBalancesRef = useRef<boolean>(false)
  const refreshUnifiWalletManagedTokenBalances = useCallback(() => {
    if (!connector || connector.id !== 'unifiwallet' || !account) {
      return
    }

    if (pendingUnifiWalletTokenBalancesRef.current) {
      return
    }

    pendingUnifiWalletTokenBalancesRef.current = true

    connector
      .getProvider()
      ?.then((provider) =>
        Promise.all(
          UNIFI_MANAGED_TOKENS.map((token) => token.address.toLowerCase()).map((tokenAddress) =>
            provider.getErc20TokenBalanceWithDepositedBalance(tokenAddress, account).then((balance) => ({
              tokenAddress,
              balance: balance.toString(),
            })),
          ),
        ).then((balances) => {
          setCachedUnifiWalletTokenBalances((prev) => ({
            ...prev,
            [account]: {
              ...(prev[account] ?? {}),
              ...balances.reduce<{ [tokenAddress: string]: string }>((acc, item) => {
                return {
                  ...acc,
                  [item.tokenAddress]: item.balance,
                }
              }, {}),
            },
          }))
        }),
      )
      .catch((error) => {
        console.error('Failed to fetch UniFi wallet token balances:', error)
      })
      .finally(() => {
        pendingUnifiWalletTokenBalancesRef.current = false
      })
  }, [connector, account, setCachedUnifiWalletTokenBalances])

  useEffect(() => {
    setRefreshUnifiWalletManagedTokenBalances({ fn: refreshUnifiWalletManagedTokenBalances })
  }, [refreshUnifiWalletManagedTokenBalances, setRefreshUnifiWalletManagedTokenBalances])

  const isUnifiWallet = connector?.id === 'unifiwallet'

  // Refresh immediately on mount + automatically refresh every 30 seconds based on cache TTL
  useEffect(() => {
    let cleanup: (() => void) | undefined

    if (isUnifiWallet && account) {
      refreshUnifiWalletManagedTokenBalances()
      const intervalId = setInterval(refreshUnifiWalletManagedTokenBalances, 30 * 1_000)
      cleanup = () => {
        clearInterval(intervalId)
      }
    }

    return cleanup
  }, [isUnifiWallet, account, refreshUnifiWalletManagedTokenBalances])

  return {
    refreshUnifiWalletManagedTokenBalances,
  }
}

export function useUnifiWalletUSDTBalances() {
  return useUnifiWalletManagedTokenBalancesSync()
}

export function useUnifiWalletManagedTokenBalances() {
  const { connector, address: account } = useAccount()
  const [cachedUnifiWalletTokenBalances] = useAtom(cachedUnifiWalletTokenBalancesAtom)

  const isUnifiWallet = connector?.id === 'unifiwallet'
  const accountBalances = account ? cachedUnifiWalletTokenBalances[account] : undefined

  return useMemo(() => {
    if (!isUnifiWallet || !account || !accountBalances) {
      return {} as Record<string, CurrencyAmount<Token> | undefined>
    }

    return UNIFI_MANAGED_TOKENS.reduce<Record<string, CurrencyAmount<Token> | undefined>>((memo, token) => {
      const tokenAddress = token.address.toLowerCase()
      const balance = accountBalances[tokenAddress]
      memo[tokenAddress] = balance ? CurrencyAmount.fromRawAmount(token, BigInt(balance)) : undefined
      return memo
    }, {})
  }, [isUnifiWallet, account, accountBalances])
}

export function useUnifiWalletManagedTokenBalance(token?: Token) {
  const balances = useUnifiWalletManagedTokenBalances()
  const tokenAddress = token?.address?.toLowerCase()
  if (!tokenAddress) return undefined
  return balances[tokenAddress]
}

export function useUnifiWalletUSDTBalance() {
  return useUnifiWalletManagedTokenBalance(TETHER_TOKEN)
}

export function useUnifiWalletJPYCBalance() {
  return useUnifiWalletManagedTokenBalance(JPYC_TOKEN)
}
