import { Currency, Token } from '@pancakeswap/swap-sdk-core'
import { DEFAULT_LOCAL_STORAGE_DATA, LOCAL_STORAGE_KEYS } from 'defines/local-storage-keys'

import useLocalStorage from 'hooks/useLocalStorage'
import { useCallback, useMemo } from 'react'

export default function useRecentSelectedCurrencies() {
  const [recentSelectedCurrencies, setRecentSelectedCurrencies] = useLocalStorage<Currency[]>(
    LOCAL_STORAGE_KEYS.recentSelectedCurrencies,
    DEFAULT_LOCAL_STORAGE_DATA.recentSelectedCurrencies,
  )

  const currencies = useMemo(() => {
    if (!recentSelectedCurrencies || recentSelectedCurrencies.length === 0) return []
    return recentSelectedCurrencies
      .filter((c) => (c as Token)?.address)
      .map((c) => new Token(c.chainId, (c as Token).address, c.decimals, c.symbol, c.name))
  }, [recentSelectedCurrencies])

  const setRecentSelectedCurrency = useCallback(
    (currency: Token) => {
      if (currency.isNative) return

      const newRecent =
        recentSelectedCurrencies?.filter(
          (c) => (c as Token).address.toLowerCase() !== currency.address.toLowerCase(),
        ) ?? []
      setRecentSelectedCurrencies([currency, ...newRecent].slice(0, 5))
    },
    [recentSelectedCurrencies, setRecentSelectedCurrencies],
  )

  return { recentSelectedCurrencies: currencies, setRecentSelectedCurrency }
}
