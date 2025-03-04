import { ExternalLink, TagV2 } from '@pancakeswap/uikit'
import { Trans, useTranslation } from 'next-i18next'
import { TransactionDetails } from 'state/transactions/reducer'
import { getBlockExploreLink, getBlockExploreName } from 'utils'

export default function Transaction({ tx }: { tx: TransactionDetails }) {
  const { t } = useTranslation()

  const summary = tx?.summary
  const translatableSummary = tx?.translatableSummary
  const pending = !tx?.receipt
  const success = !pending && tx && (tx.receipt?.status === 1 || typeof tx.receipt?.status === 'undefined')

  return (
    <div>
      <div className="flex items-center space-x-2 justify-between">
        <TagV2 color={pending ? 'default' : success ? 'green' : 'red'}>
          {pending ? 'pending' : success ? 'success' : 'failed'}
        </TagV2>

        <ExternalLink href={getBlockExploreLink(tx.hash, 'transaction')}>{getBlockExploreName()}</ExternalLink>
      </div>

      <p className="text-sm text-on-surface mt-1.5">
        {translatableSummary ? (
          <Trans t={t} i18nKey={translatableSummary.text} values={translatableSummary.data} />
        ) : summary ? (
          t(summary)
        ) : (
          tx.hash
        )}
      </p>
    </div>
  )
}
