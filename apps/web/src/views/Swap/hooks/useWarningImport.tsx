import { Token } from '@pancakeswap/sdk'
import { useModal } from '@pancakeswap/uikit'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { useRouter } from 'next/router'
import shouldShowSwapWarning from 'utils/shouldShowSwapWarning'

import ImportTokenWarningModal from 'components/ImportTokenWarningModal'
import { useCurrency, useTokenMap } from 'hooks/Tokens'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import { Field } from 'state/swap/actions'
import { useSwapState } from 'state/swap/hooks'

import { useUserAddedTokenMapFromLs } from 'state/user/hooks/useUserAddedTokens'
import SwapWarningModal from '../components/SwapWarningModal'

export default function useWarningImport() {
  const router = useRouter()
  const { chainId, isWrongNetwork } = useActiveWeb3React()
  const {
    [Field.INPUT]: { currencyId: inputCurrencyId },
    [Field.OUTPUT]: { currencyId: outputCurrencyId },
  } = useSwapState()

  // swap warning state
  const [swapWarningCurrency, setSwapWarningCurrency] = useState<any>(null)

  // token warning stuff
  const [loadedInputCurrency, loadedOutputCurrency] = [useCurrency(inputCurrencyId), useCurrency(outputCurrencyId)]

  const urlLoadedTokens: Token[] = useMemo(
    () => [loadedInputCurrency, loadedOutputCurrency]?.filter((c): c is Token => Boolean(c?.isToken)) ?? [],
    [loadedInputCurrency, loadedOutputCurrency],
  )

  const { tokenMap: poolOnlyTokenMap } = useTokenMap({ poolOnly: true })
  const { userAddedTokenMap } = useUserAddedTokenMapFromLs()

  const needToImportTokens = useMemo(() => {
    return poolOnlyTokenMap && !isWrongNetwork && userAddedTokenMap
      ? urlLoadedTokens.filter((token: Token) => {
          return (
            !poolOnlyTokenMap[token.address] &&
            !userAddedTokenMap[token.address.toLowerCase()] &&
            token.chainId === chainId
          )
        })
      : []
  }, [chainId, poolOnlyTokenMap, isWrongNetwork, userAddedTokenMap, urlLoadedTokens])

  const [onPresentSwapWarningModal] = useModal(<SwapWarningModal swapCurrency={swapWarningCurrency} />, false)
  const [onPresentImportTokenWarningModal] = useModal(
    <ImportTokenWarningModal
      tokens={needToImportTokens}
      onCancel={() => router.push('/swap')}
      customOnDismiss={() => router.push('/swap')}
    />,
  )

  useEffect(() => {
    if (swapWarningCurrency) {
      onPresentSwapWarningModal()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [swapWarningCurrency])

  const swapWarningHandler = useCallback(
    (currencyInput) => {
      const showSwapWarning = shouldShowSwapWarning(chainId, currencyInput)
      if (showSwapWarning) {
        setSwapWarningCurrency(currencyInput)
      } else {
        setSwapWarningCurrency(null)
      }
    },
    [chainId],
  )

  useEffect(() => {
    if (needToImportTokens.length > 0) {
      onPresentImportTokenWarningModal()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [needToImportTokens.length])

  return swapWarningHandler
}
