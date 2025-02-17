import { CustomSelect, SelectOption } from '@pancakeswap/uikit'
import { useWindowSize } from 'hooks/useWindowSize'
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
  const { width: windowWidth } = useWindowSize()

  return (
    <CustomSelect
      prefix={windowWidth < 530 ? undefined : 'Pool Type'}
      options={poolTypeSelectorOptions}
      selectedOption={selectedPoolTypes}
      multiple
      onSelect={onSelectPoolTypes}
    />
  )
}
