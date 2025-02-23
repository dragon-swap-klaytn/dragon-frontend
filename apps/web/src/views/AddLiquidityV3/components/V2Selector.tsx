import { useTranslation } from '@pancakeswap/localization'
import { ButtonV2 } from '@pancakeswap/uikit'
import { TOTAL_FEE } from 'config/constants/info'
import { useState } from 'react'
import { HandleFeePoolSelectFn, SELECTOR_TYPE } from '../types'
import HideShowSelectorSection from './HideShowSelectorSection'

export function V2Selector({
  isStable,
  handleFeePoolSelect,
  selectorType,
}: {
  isStable: boolean
  selectorType: SELECTOR_TYPE
  handleFeePoolSelect: HandleFeePoolSelectFn
}) {
  const { t } = useTranslation()
  const [showOptions, setShowOptions] = useState(false)

  return (
    <HideShowSelectorSection
      showOptions={showOptions}
      setShowOptions={setShowOptions}
      heading={
        <span className="text-[15px] text-on-surface">
          {selectorType === SELECTOR_TYPE.STABLE
            ? 'StableSwap LP'
            : selectorType === SELECTOR_TYPE.V2
            ? `V2 LP - ${(TOTAL_FEE * 100).toFixed(2)} ${t('fee tier')}`
            : 'V3 LP'}
        </span>
      }
      content={
        <div className="grid grid-cols-2 gap-3 w-full">
          {isStable ? (
            <ButtonV2
              variant={selectorType === SELECTOR_TYPE.STABLE ? 'primary' : 'blank'}
              onClick={() => handleFeePoolSelect({ type: SELECTOR_TYPE.STABLE })}
              fullWidth
              scale="sm"
            >
              StableSwap LP
            </ButtonV2>
          ) : (
            <ButtonV2
              variant={selectorType === SELECTOR_TYPE.V3 ? 'primary' : 'blank'}
              onClick={() => handleFeePoolSelect({ type: SELECTOR_TYPE.V3 })}
              fullWidth
              scale="sm"
            >
              V3 LP
            </ButtonV2>
          )}

          <ButtonV2
            variant={selectorType === SELECTOR_TYPE.V2 ? 'primary' : 'blank'}
            onClick={() => handleFeePoolSelect({ type: SELECTOR_TYPE.V2 })}
            fullWidth
            scale="sm"
          >
            V2 LP
          </ButtonV2>
        </div>
      }
    />
  )
}
