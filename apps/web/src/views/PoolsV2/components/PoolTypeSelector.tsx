import { CustomSelect, SelectOption } from '@pancakeswap/uikit'
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
export type PoolTypeSelectorOptions = typeof poolTypeSelectorOptions

type PoolTypeSelectorProps = {
  selectedPoolTypes: SelectOption[]
  onSelectPoolTypes: (poolTypes: SelectOption[]) => void
}

export default function PoolTypeSelector({ selectedPoolTypes, onSelectPoolTypes }: PoolTypeSelectorProps) {
  const { t } = useTranslation()

  return (
    <CustomSelect
      prefix={t('Pool Type')}
      prefixClassName="hidden md:inline"
      options={poolTypeSelectorOptions}
      selectedOption={selectedPoolTypes}
      multiple
      onSelect={onSelectPoolTypes}
    />
  )
}
