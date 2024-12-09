import { CircleNotch } from '@phosphor-icons/react'
import clsx from 'clsx'

export default function Loading({ className, size = 24 }: { className?: string; size?: number }) {
  return <CircleNotch size={size} className={clsx('animate-spin', className)} />
}
