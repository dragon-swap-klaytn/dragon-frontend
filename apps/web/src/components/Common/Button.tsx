import clsx from 'clsx'
import { MouseEventHandler, PropsWithChildren } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'subtle' | 'blank'
type ButtonState = 'disabled' | 'loading'
export default function Button({
  children,
  onClick,
  className,
  disabled,
  variant,
  size = 'md',
  fullWidth,
  state,
}: PropsWithChildren<{
  onClick: MouseEventHandler<HTMLButtonElement>
  className?: string
  disabled?: boolean
  variant: ButtonVariant
  size?: 'md' | 'sm'
  fullWidth?: boolean
  state?: ButtonState
}>) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        'hover:opacity-70 rounded-[20px] text-sm disabled:bg-surface-disable disabled:text-on-surface-tertiary',
        className,
        state && ['disabled', 'loading'].includes(state)
          ? 'bg-surface-disable text-on-surface-tertiary'
          : variant === 'primary'
          ? 'bg-surface-orange text-on-surface-orange'
          : variant === 'secondary'
          ? 'bg-gray-50 text-on-surface-orange'
          : variant === 'subtle'
          ? 'bg-surface-container-highest text-on-surface-primary'
          : variant === 'blank'
          ? 'bg-transparent border-gray-700 border'
          : '',
        {
          'px-3 h-9': size === 'sm',
          'px-4 h-10': size === 'md',
          'w-full': fullWidth,
        },
      )}
      disabled={disabled}
    >
      {children}
    </button>
  )
}
