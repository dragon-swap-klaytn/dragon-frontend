import { useTranslation } from '@pancakeswap/localization'
import { ExternalLink } from '@pancakeswap/uikit'
import truncateHash from '@pancakeswap/utils/truncateHash'
import { getBlockExploreLink, getBlockExploreName } from 'utils'

interface DescriptionWithTxProps {
  description?: string
  txHash?: string
  txChainId?: number
}

const DescriptionWithTx: React.FC<React.PropsWithChildren<DescriptionWithTxProps>> = ({
  txHash,
  txChainId,
  children,
}) => {
  const { t } = useTranslation()

  return (
    <>
      {typeof children === 'string' ? <p className="text-sm text-on-surface text-left">{children}</p> : children}
      {txHash && (
        <ExternalLink href={getBlockExploreLink(txHash, 'transaction')} className="mt-1 text-on-surface">
          {t('View on %site%', { site: getBlockExploreName() })}: {truncateHash(txHash, 8, 0)}
        </ExternalLink>
      )}
    </>
  )
}

export default DescriptionWithTx
