import { Chip } from '@pancakeswap/uikit'
import { FeeAmount } from '@pancakeswap/v3-sdk'
import { CaretRight } from '@phosphor-icons/react'
import clsx from 'clsx'
import { Dispatch, ReactElement, SetStateAction } from 'react'

interface HideShowSelectorSectionPropsType {
  noHideButton?: boolean
  showOptions: boolean
  setShowOptions: Dispatch<SetStateAction<boolean>>
  heading: ReactElement
  content: ReactElement
  feeAmount?: FeeAmount
}

export default function HideShowSelectorSection({
  noHideButton,
  showOptions,
  setShowOptions,
  heading,
  content,
  feeAmount,
}: HideShowSelectorSectionPropsType) {
  return (
    <div className="p-4 flex flex-col space-y-3 items-start bg-neutral rounded-xl">
      <div className="flex items-center justify-between space-x-2 w-full">
        {heading ?? <div />}

        {noHideButton || (
          <button
            type="button"
            onClick={() => setShowOptions((prev) => !prev)}
            className="text-sm text-on-surface flex items-center space-x-1"
          >
            <span className="inline-block w-9">{showOptions ? 'Hide' : 'More'}</span>

            <CaretRight
              size={16}
              className={clsx('text-on-surface transition', {
                'rotate-90': !showOptions,
              })}
            />
          </button>
        )}
      </div>

      {showOptions ? content : feeAmount ? <Chip color="orange">{(feeAmount / 10_000).toFixed(2)}% Pick</Chip> : <></>}
    </div>
  )
}
