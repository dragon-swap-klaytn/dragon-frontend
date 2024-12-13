import { ArrowSquareOut } from '@phosphor-icons/react'
import clsx from 'clsx'
import { TransactionDetails } from 'state/transactions/reducer'
import { getBlockExploreLink } from 'utils'

export default function Transaction({ tx, chainId }: { tx: TransactionDetails; chainId: number }) {
  const summary = tx?.summary
  const pending = !tx?.receipt
  const success = !pending && tx && (tx.receipt?.status === 1 || typeof tx.receipt?.status === 'undefined')

  if (!chainId) return null

  return (
    <div className="flex items-center space-x-2 justify-between">
      <a
        href={getBlockExploreLink(tx.hash, 'transaction', chainId)}
        target="_blank"
        rel="noreferrer"
        className="text-sm underline underline-offset-2 hover:opacity-70"
      >
        {summary ?? tx.hash}

        <ArrowSquareOut size={16} className="inline-block ml-1" />
      </a>

      <span
        className={clsx('text-sm', {
          'text-gray-400': pending,
          'text-green-400': success,
          'text-red-400': !success,
        })}
      >
        {pending ? 'Pending' : success ? 'Success' : 'Failed'}
      </span>
    </div>
  )
}
