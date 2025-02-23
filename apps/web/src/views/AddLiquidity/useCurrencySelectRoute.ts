import { Currency } from '@pancakeswap/sdk'
import { USDC, USDT } from '@pancakeswap/tokens'
import { useBackTo } from '@pancakeswap/uikit/hooks/use-back-to'
import { useActiveChainId } from 'hooks/useActiveChainId'
import useNativeCurrency from 'hooks/useNativeCurrency'
import { useRouter } from 'next/router'
import { useCallback } from 'react'
import currencyId from 'utils/currencyId'

export const useCurrencySelectRoute = () => {
  const native = useNativeCurrency()
  const router = useRouter()
  const { chainId } = useActiveChainId()
  const [currencyIdA, currencyIdB] = router.query.currency || [
    native.symbol,
    USDT[chainId]?.address ?? USDC[chainId]?.address,
  ]

  const { saveBackToHref } = useBackTo()

  const handleCurrencyASelect = useCallback(
    (currencyA_: Currency) => {
      saveBackToHref()
      const newCurrencyIdA = currencyId(currencyA_)
      if (newCurrencyIdA === currencyIdB) {
        router.replace(`/add/${currencyIdB}/${currencyIdA}`, undefined, { shallow: true })
      } else if (currencyIdB) {
        router.replace(`/add/${newCurrencyIdA}/${currencyIdB}`, undefined, { shallow: true })
      } else {
        router.replace(`/add/${newCurrencyIdA}`, undefined, { shallow: true })
      }
    },
    [currencyIdB, router, currencyIdA, saveBackToHref],
  )
  const handleCurrencyBSelect = useCallback(
    (currencyB_: Currency) => {
      saveBackToHref()
      const newCurrencyIdB = currencyId(currencyB_)
      if (currencyIdA === newCurrencyIdB) {
        if (currencyIdB) {
          router.replace(`/add/${currencyIdB}/${newCurrencyIdB}`, undefined, { shallow: true })
        } else {
          router.replace(`/add/${newCurrencyIdB}`, undefined, { shallow: true })
        }
      } else {
        router.replace(`/add/${currencyIdA || native.symbol}/${newCurrencyIdB}`, undefined, { shallow: true })
      }
    },
    [currencyIdA, router, currencyIdB, native, saveBackToHref],
  )

  return {
    handleCurrencyASelect,
    handleCurrencyBSelect,
  }
}
