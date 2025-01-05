import clsx from 'clsx'
import { MouseEventHandler, PropsWithChildren } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'subtle' | 'blank'
type ButtonState = 'loading' | 'default'
export default function Button({
  children,
  onClick,
  className,
  disabled,
  variant,
  scale = 'md',
  fullWidth,
  state,
}: PropsWithChildren<{
  onClick: MouseEventHandler<HTMLButtonElement>
  className?: string
  disabled?: boolean
  variant: ButtonVariant
  scale?: 'xs' | 'sm' | 'md'
  fullWidth?: boolean
  state?: ButtonState
}>) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        'rounded-[20px] disabled:bg-surface-disable disabled:text-on-surface-tertiary disabled:cursor-not-allowed',
        className,
        state && ['loading'].includes(state)
          ? 'bg-surface-disable text-on-surface-tertiary'
          : variant === 'primary'
          ? 'bg-surface-orange text-on-surface-orange'
          : variant === 'secondary'
          ? 'bg-gray-50 text-on-surface-orange'
          : variant === 'subtle'
          ? 'bg-surface-container-highest text-on-surface-primary'
          : variant === 'blank'
          ? 'bg-transparent border-gray-700 border text-on-surface-primary'
          : '',
        {
          'hover:opacity-70': !disabled,
          'px-2 py-1 text-xs': scale === 'xs',
          'px-3 py-2 text-sm': scale === 'sm',
          'px-4 py-3 text-sm': scale === 'md',
          'w-full': fullWidth,
        },
      )}
      disabled={disabled}
    >
      {children}
    </button>
  )
}
