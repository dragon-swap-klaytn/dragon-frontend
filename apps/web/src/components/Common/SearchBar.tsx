import { MagnifyingGlass, XCircle } from '@phosphor-icons/react'
import clsx from 'clsx'
import React, { InputHTMLAttributes } from 'react'

type SearchBarProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'className' | 'value' | 'onChange' | 'onKeyDown'> &
  Required<Pick<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'onKeyDown'>> & {
    fullWidth?: boolean
  }

// export default function SearchBar(props: SearchBarProps) {
const SearchBar = React.forwardRef<HTMLInputElement, SearchBarProps>((props, ref) => {
  return (
    <div
      className={clsx(
        'px-3 py-2 flex items-center rounded-full bg-surface-container-highest',
        props.fullWidth ? 'w-full' : 'w-60',
      )}
    >
      <div>
        <MagnifyingGlass className="pointer-events-none size-4 text-on-surface-primary" aria-hidden="true" />
      </div>
      <input
        ref={ref}
        className="outline-none flex-grow border-0 bg-transparent px-2 focus:ring-0 text-sm text-on-surface-primary placeholder-on-surface-tertiary"
        placeholder="Search..."
        {...props}
      />
      <button
        type="button"
        className={clsx('-translate-x-1 p-0.5 size-5 rounded-full hover:opacity-70', {
          invisible: !props.value,
        })}
        disabled={props.value === ''}
        onClick={() => props.onChange?.({ target: { value: '' } } as any)}
      >
        <XCircle weight="fill" className="size-4 text-on-surface-tertiary" />
      </button>
    </div>
  )
})

export default SearchBar
