import { ChainId } from '@pancakeswap/chains'
import { useTranslation } from '@pancakeswap/localization'
import { Currency, Token } from '@pancakeswap/sdk'
import { ButtonV2, ExternalLink, InjectedModalProps, Modal, ModalProps } from '@pancakeswap/uikit'
import { ConfirmationPendingContent, TransactionErrorContent } from '@pancakeswap/widgets-internal'
import { ArrowCircleUp } from '@phosphor-icons/react'
import useA2AConnectorQRUri from 'hooks/useA2AConnectorQRUri'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { useTokenLogo } from 'hooks/useTokenLogo'
import { useCallback } from 'react'
import { getBlockExploreLink, getBlockExploreName } from 'utils'
import { wrappedCurrency } from 'utils/wrappedCurrency'
import AddToWalletButton, { AddToWalletTextOptions } from '../AddToWallet/AddToWalletButton'

export function TransactionSubmittedContent({
  onDismiss,
  chainId,
  hash,
  currencyToAdd,
}: {
  onDismiss: () => void
  hash: string | undefined
  chainId: ChainId
  currencyToAdd?: Currency | undefined
}) {
  const { t } = useTranslation()

  const token: Token | undefined = wrappedCurrency(currencyToAdd, chainId)
  const tokenLogo = useTokenLogo(token)

  return (
    <div className="w-full flex flex-col items-center">
      <ArrowCircleUp size={80} className="text-on-surface" />

      <div className="flex flex-col items-center space-y-3 mt-6">
        <p className="text-on-surface">{t('Transaction Submitted')}</p>
        {chainId && hash && (
          <ExternalLink href={getBlockExploreLink(hash, 'transaction', chainId)} className="text-on-surface-subtle">
            {t('View on %site%', {
              site: getBlockExploreName(chainId),
            })}
          </ExternalLink>
        )}
      </div>

      <div className="mt-4 flex flex-col items-center space-y-2">
        {currencyToAdd && (
          <AddToWalletButton
            textOptions={AddToWalletTextOptions.TEXT_WITH_ASSET}
            tokenAddress={token?.address}
            tokenSymbol={currencyToAdd.symbol}
            tokenDecimals={token?.decimals}
            tokenLogo={tokenLogo}
          />
        )}

        <ButtonV2 onClick={onDismiss} variant="subtle">
          {t('Close')}
        </ButtonV2>
      </div>
    </div>
  )
}

interface ConfirmationModalProps {
  title: string
  customOnDismiss?: () => void
  hash: string | undefined
  errorMessage?: string
  content: () => React.ReactNode
  attemptingTxn: boolean
  pendingText: string
  currencyToAdd?: Currency | undefined
}

const TransactionConfirmationModal: React.FC<
  React.PropsWithChildren<InjectedModalProps & ConfirmationModalProps & ModalProps>
> = ({
  title,
  onDismiss,
  customOnDismiss,
  attemptingTxn,
  errorMessage,
  hash,
  pendingText,
  content,
  currencyToAdd,
  ...props
}) => {
  const qrUri = useA2AConnectorQRUri()

  const { chainId } = useActiveChainId()

  const handleDismiss = useCallback(() => {
    if (customOnDismiss) {
      customOnDismiss()
    }

    onDismiss?.()
  }, [customOnDismiss, onDismiss])

  if (!chainId) return null

  return (
    <Modal title={title} {...props} onDismiss={handleDismiss} maxWidth="max-w-sm">
      {attemptingTxn ? (
        <ConfirmationPendingContent qrUri={qrUri} pendingText={pendingText} />
      ) : hash ? (
        <TransactionSubmittedContent
          chainId={chainId}
          hash={hash}
          onDismiss={handleDismiss}
          currencyToAdd={currencyToAdd}
        />
      ) : errorMessage ? (
        <TransactionErrorContent message={errorMessage} onDismiss={handleDismiss} />
      ) : (
        content()
      )}
    </Modal>
  )
}

export default TransactionConfirmationModal
