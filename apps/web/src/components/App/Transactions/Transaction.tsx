import { ExternalLink, TagV2 } from '@pancakeswap/uikit'
import { TransactionDetails } from 'state/transactions/reducer'
import { getBlockExploreLink, getBlockExploreName } from 'utils'

export default function Transaction({ tx, chainId }: { tx: TransactionDetails; chainId: number }) {
  const summary = tx?.summary
  const pending = !tx?.receipt
  const success = !pending && tx && (tx.receipt?.status === 1 || typeof tx.receipt?.status === 'undefined')

  if (!chainId) return null

  return (
    <div>
      <div className="flex items-center space-x-2 justify-between">
        <TagV2 color={pending ? 'default' : success ? 'green' : 'red'}>
          {pending ? 'pending' : success ? 'success' : 'failed'}
        </TagV2>

        <ExternalLink href={getBlockExploreLink(tx.hash, 'transaction')}>{getBlockExploreName()}</ExternalLink>
      </div>

      <p className="text-sm text-on-surface mt-1.5">{summary ?? tx.hash}</p>
    </div>
  )
}
