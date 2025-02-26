import replaceBrowserHistory from '@pancakeswap/utils/replaceBrowserHistory'
import { memo, useCallback } from 'react'

import { Field } from 'state/swap/actions'
import { useSwapState } from 'state/swap/hooks'
import { useSwapActionHandlers } from 'state/swap/useSwapActionHandlers'

import { ArrowCircleDown } from '@phosphor-icons/react'

export const FlipButton = memo(function FlipButton() {
  const { onSwitchTokens } = useSwapActionHandlers()
  const {
    [Field.INPUT]: { currencyId: inputCurrencyId },
    [Field.OUTPUT]: { currencyId: outputCurrencyId },
  } = useSwapState()

  const onFlip = useCallback(() => {
    onSwitchTokens()
    replaceBrowserHistory('inputCurrency', outputCurrencyId)
    replaceBrowserHistory('outputCurrency', inputCurrencyId)
  }, [onSwitchTokens, inputCurrencyId, outputCurrencyId])

  return (
    <button type="button" onClick={onFlip} className="self-center">
      <ArrowCircleDown
        size={24}
        className="text-gray-50 transition-transform hover:rotate-180 duration-300 ease-in-out"
      />
    </button>
  )
})
