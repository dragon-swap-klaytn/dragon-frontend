import { CaretUpDown } from 'components/Vector'
import { ReactNode } from 'react'
import { SortDirection } from 'views/Dashboard/types'

export default function SortHeaderButton({
  title,
  onClick,
  isSelected,
  sortDirection,
}: {
  title: ReactNode
  onClick: () => void
  isSelected: boolean
  sortDirection: SortDirection
}) {
  return (
    <button type="button" onClick={onClick} className="flex items-center space-x-2">
      <span className="w-min">{title}</span>

      <div className="flex items-center">
        <CaretUpDown up={isSelected && sortDirection === 'asc'} down={isSelected && sortDirection === 'desc'} />
      </div>
    </button>
  )
}
