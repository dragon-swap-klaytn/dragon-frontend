import { atom, useAtom } from 'jotai'
import { useCallback, useEffect, useMemo, useRef } from 'react'

import { CurrencyAmount } from '@pancakeswap/swap-sdk-core'
import { TETHER_ADDRESS } from '@pancakeswap/uikit'
import { TETHER_TOKEN } from 'const'
import { useAccount } from 'wagmi'

const cachedUnifiWalletUSDTBalanceAtom = atom<{
  [address: string]: string
}>({})
export const refreshUnifiWalletUSDTBalanceAtom = atom<{ fn: () => void }>({ fn: () => {} })
export const unifiWalletProviderAtom = atom(null as any)

export function useUnifiWalletUSDTBalances() {
  const { connector, address: account } = useAccount()

  const [, setCachedUnifiWalletUSDTBalances] = useAtom(cachedUnifiWalletUSDTBalanceAtom)
  const [, setRefreshUnifiWalletUSDTBalance] = useAtom(refreshUnifiWalletUSDTBalanceAtom)
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

  const pendingUnifiWalletUSDTBalanceRef = useRef<boolean>(false)
  const refreshUnifiWalletUSDTBalance = useCallback(() => {
    if (!connector || connector.id !== 'unifiwallet' || !account) {
      return
    }

    if (pendingUnifiWalletUSDTBalanceRef.current) {
      return
    }

    pendingUnifiWalletUSDTBalanceRef.current = true

    connector
      .getProvider()
      ?.then((provider) =>
        provider.getErc20TokenBalanceWithDepositedBalance(TETHER_ADDRESS, account).then((balance) => {
          setCachedUnifiWalletUSDTBalances((prev) => ({
            ...prev,
            [account]: balance.toString(),
          }))
        }),
      )
      .catch((error) => {
        console.error('Failed to fetch UniFi wallet USDT balance:', error)
      })
      .finally(() => {
        pendingUnifiWalletUSDTBalanceRef.current = false
      })
  }, [connector, account, setCachedUnifiWalletUSDTBalances])

  useEffect(() => {
    setRefreshUnifiWalletUSDTBalance({ fn: refreshUnifiWalletUSDTBalance })
  }, [refreshUnifiWalletUSDTBalance, setRefreshUnifiWalletUSDTBalance])

  const isUnifiWallet = connector?.id === 'unifiwallet'

  // Refresh immediately on mount + automatically refresh every 30 seconds based on cache TTL
  useEffect(() => {
    let cleanup: (() => void) | undefined

    if (isUnifiWallet && account) {
      refreshUnifiWalletUSDTBalance()
      const intervalId = setInterval(refreshUnifiWalletUSDTBalance, 30 * 1_000)
      cleanup = () => {
        clearInterval(intervalId)
      }
    }

    return cleanup
  }, [isUnifiWallet, account, refreshUnifiWalletUSDTBalance])

  return {
    refreshUnifiWalletUSDTBalance,
  }
}

export function useUnifiWalletUSDTBalance() {
  const { connector, address: account } = useAccount()
  const [cachedUnifiWalletUSDTBalances] = useAtom(cachedUnifiWalletUSDTBalanceAtom)

  const isUnifiWallet = connector?.id === 'unifiwallet'
  const balance = account ? cachedUnifiWalletUSDTBalances[account] : undefined

  const unifiWalletUSDTBalance = useMemo(() => {
    if (!isUnifiWallet || !account) return undefined

    return balance ? CurrencyAmount.fromRawAmount(TETHER_TOKEN, BigInt(balance)) : undefined
  }, [isUnifiWallet, account, balance])

  return unifiWalletUSDTBalance
}
