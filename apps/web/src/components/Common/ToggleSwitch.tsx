import { Switch } from '@headlessui/react'
import clsx from 'clsx'

export default function ToggleSwitch({
  activated,
  setActivated,
  readOnly = false,
  disabled = false,
  className,
}: {
  activated: boolean
  setActivated?: (checked: boolean) => void
  readOnly?: boolean
  disabled?: boolean
  tooltip?: string
  tooltipPlace?: 'top' | 'bottom' | 'left' | 'right'
  className?: string
}) {
  return (
    <Switch
      checked={activated}
      onChange={setActivated}
      className={clsx(
        activated ? 'bg-surface-orange' : 'bg-surface-disable',
        'relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none',
        className,
        {
          'cursor-default': readOnly,
          'cursor-pointer': !readOnly && !disabled,
          'opacity-40': disabled,
        },
      )}
      disabled={disabled}
    >
      <span
        aria-hidden="true"
        className={clsx(
          activated ? 'translate-x-5' : 'translate-x-0',
          'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out',
        )}
      />
    </Switch>
  )
}
