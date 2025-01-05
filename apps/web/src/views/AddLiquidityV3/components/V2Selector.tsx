import { useTranslation } from '@pancakeswap/localization'
import { TOTAL_FEE } from 'config/constants/info'
import { useState } from 'react'

import Button from 'components/Common/Button'
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
        <span className="text-[15px] text-on-surface-primary">
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
            <Button
              variant={selectorType === SELECTOR_TYPE.STABLE ? 'primary' : 'blank'}
              onClick={() => handleFeePoolSelect({ type: SELECTOR_TYPE.STABLE })}
              fullWidth
            >
              {/* <SelectButton
                isActive={selectorType === SELECTOR_TYPE.STABLE}
                onClick={() => handleFeePoolSelect({ type: SELECTOR_TYPE.STABLE })}
              > */}
              StableSwap LP
              {/* </SelectButton> */}
            </Button>
          ) : (
            <Button
              variant={selectorType === SELECTOR_TYPE.V3 ? 'primary' : 'blank'}
              onClick={() => handleFeePoolSelect({ type: SELECTOR_TYPE.V3 })}
              fullWidth
            >
              {/* <SelectButton
                isActive={selectorType === SELECTOR_TYPE.STABLE}
                onClick={() => handleFeePoolSelect({ type: SELECTOR_TYPE.STABLE })}
              > */}
              V3 LP
              {/* </SelectButton> */}
            </Button>

            // <>
            //   <SelectButton
            //     isActive={selectorType === SELECTOR_TYPE.V3}
            //     onClick={() => handleFeePoolSelect({ type: SELECTOR_TYPE.V3 })}
            //   >
            //     V3 LP
            //   </SelectButton>
            // </>
          )}

          <Button
            variant={selectorType === SELECTOR_TYPE.V2 ? 'primary' : 'blank'}
            onClick={() => handleFeePoolSelect({ type: SELECTOR_TYPE.V2 })}
            fullWidth
          >
            {/* <SelectButton
                isActive={selectorType === SELECTOR_TYPE.STABLE}
                onClick={() => handleFeePoolSelect({ type: SELECTOR_TYPE.STABLE })}
              > */}
            V2 LP
            {/* </SelectButton> */}
          </Button>

          {/* <SelectButton
            isActive={selectorType === SELECTOR_TYPE.V2}
            onClick={() => handleFeePoolSelect({ type: SELECTOR_TYPE.V2 })}
          >
            V2 LP
          </SelectButton> */}
        </div>
      }
    />
  )
}
