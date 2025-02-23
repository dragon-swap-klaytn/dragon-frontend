import { CustomSelect, SelectOption, useMatchBreakpoints } from '@pancakeswap/uikit'
import { useTranslation } from 'next-i18next'
import { PoolType } from 'types'

export const poolTypeSelectorOptions = [
  {
    label: 'V2',
    value: 'v2' as PoolType,
  },
  {
    label: 'V3',
    value: 'v3' as PoolType,
  },
]

type PoolTypeSelectorProps = {
  selectedPoolTypes: SelectOption[]
  onSelectPoolTypes: (poolTypes: SelectOption[]) => void
}

export default function PoolTypeSelector({ selectedPoolTypes, onSelectPoolTypes }: PoolTypeSelectorProps) {
  const { isBelowS } = useMatchBreakpoints()
  const { t } = useTranslation()

  return (
    <CustomSelect
      prefix={isBelowS ? undefined : t('Pool Type')}
      options={poolTypeSelectorOptions}
      selectedOption={selectedPoolTypes}
      multiple
      onSelect={onSelectPoolTypes}
    />
  )
}
