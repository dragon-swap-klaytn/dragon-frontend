import { Trans } from '@pancakeswap/localization'
import { Lock } from '@phosphor-icons/react'
import clsx from 'clsx'
import { PropsWithChildren } from 'react'

export default function LockedDeposit({
  className,
  locked,
  children,
}: PropsWithChildren<{ locked: boolean; className?: string }>) {
  return locked ? (
    <div className={clsx('flex flex-col items-center space-y-2 p-4 rounded-2xl bg-surface-disable', className)}>
      <Lock size={24} className="text-gray-400" />

      <p className="text-center text-sm text-on-surface-subtlest">
        <Trans>The market price is outside your specified price range. Single-asset deposit only.</Trans>
      </p>
    </div>
  ) : (
    children
  )
}
