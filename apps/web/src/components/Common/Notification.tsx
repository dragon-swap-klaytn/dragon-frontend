import { CheckCircle, Info, Warning } from '@phosphor-icons/react'
import clsx from 'clsx'
import { PropsWithChildren } from 'react'

type NotificationVariant = 'positive' | 'caution' | 'warning' | 'info'
type NotificationStyle = 'highlight' | 'default'

export default function Notification({
  children,
  className,
  variant,
  nStyle = 'default',
  fullWidth = true,
}: PropsWithChildren<{
  className?: string
  variant: NotificationVariant
  nStyle?: NotificationStyle
  fullWidth?: boolean
}>) {
  return (
    <div
      className={clsx(
        'p-3 flex items-start space-x-3 rounded-xl',
        className,
        {
          highlight: {
            positive: 'bg-teal-400',
            caution: 'bg-yellow-400',
            warning: 'bg-red-400',
            info: 'bg-gray-400',
          },
          default: {
            positive: 'bg-teal-950',
            caution: 'bg-yellow-950',
            warning: 'bg-red-950',
            info: 'bg-gray-950',
          },
        }[nStyle][variant],
        {
          'w-full': fullWidth,
        },
      )}
    >
      <div
        className={clsx('w-4 h-4 shrink-0 pt-0.5', {
          'text-gray-900': nStyle === 'highlight',
          'text-teal-300': nStyle === 'default' && variant === 'positive',
          'text-yellow-300': nStyle === 'default' && variant === 'caution',
          'text-red-300': nStyle === 'default' && variant === 'warning',
          'text-gray-300': nStyle === 'default' && variant === 'info',
        })}
      >
        {
          {
            positive: <CheckCircle size={16} weight="fill" />,
            caution: <Warning size={16} weight="fill" />,
            warning: <Warning size={16} weight="fill" />,
            info: <Info size={16} weight="fill" />,
          }[variant]
        }
      </div>

      <div
        className={clsx('text-[13px] w-full', {
          'text-gray-900': nStyle === 'highlight',
          'text-teal-300': nStyle === 'default' && variant === 'positive',
          'text-yellow-300': nStyle === 'default' && variant === 'caution',
          'text-red-300': nStyle === 'default' && variant === 'warning',
          'text-gray-300': nStyle === 'default' && variant === 'info',
        })}
      >
        {children}
      </div>
    </div>
  )
}
