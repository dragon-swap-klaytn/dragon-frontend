import { CheckCircle, Warning } from '@phosphor-icons/react'
import clsx from 'clsx'
import ExternalLink from 'components/Common/ExternalLink'
import Loading from 'components/Common/Loading'
import { TransactionDetails } from 'state/transactions/reducer'
import { getBlockExploreLink } from 'utils'

export default function Transaction({ tx, chainId }: { tx: TransactionDetails; chainId: number }) {
  const summary = tx?.summary
  const pending = !tx?.receipt
  const success = !pending && tx && (tx.receipt?.status === 1 || typeof tx.receipt?.status === 'undefined')

  if (!chainId) return null

  return (
    <div className="flex items-center space-x-2 justify-between text-on-surface-primary">
      <ExternalLink href={getBlockExploreLink(tx.hash, 'transaction', chainId)}>{summary ?? tx.hash}</ExternalLink>

      <span
        className={clsx('text-sm', {
          'text-gray-400': pending,
          'text-teal-400': success,
          'text-red-400': !success,
        })}
      >
        {pending ? (
          <Loading size={20} />
        ) : success ? (
          <CheckCircle size={20} weight="fill" />
        ) : (
          <Warning size={20} weight="fill" />
        )}
      </span>
    </div>
  )
}
