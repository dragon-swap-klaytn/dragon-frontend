import { useTranslation } from '@pancakeswap/localization'
import { Text } from '@pancakeswap/uikit'
import truncateHash from '@pancakeswap/utils/truncateHash'
import ExternalLink from 'components/Common/ExternalLink'
import { useActiveChainId } from 'hooks/useActiveChainId'
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
  const { chainId } = useActiveChainId()
  const { t } = useTranslation()

  return (
    <>
      {typeof children === 'string' ? <Text as="p">{children}</Text> : children}
      {txHash && (
        <ExternalLink
          href={getBlockExploreLink(txHash, 'transaction', txChainId || chainId)}
          className="mt-1 text-on-surface-primary"
        >
          {t('View on %site%', { site: getBlockExploreName(txChainId || chainId) })}: {truncateHash(txHash, 8, 0)}
        </ExternalLink>
      )}
    </>
  )
}

export default DescriptionWithTx
