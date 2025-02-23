import { ChainId } from '@pancakeswap/chains'
import { useTranslation } from '@pancakeswap/localization'
import { Currency, Token } from '@pancakeswap/sdk'
import { ExternalLink, InjectedModalProps, Modal, ModalProps } from '@pancakeswap/uikit'
import { ConfirmationPendingContent, TransactionErrorContent } from '@pancakeswap/widgets-internal'
import { ArrowCircleUp } from '@phosphor-icons/react'
import useA2AConnectorQRUri from 'hooks/useA2AConnectorQRUri'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { FC, PropsWithChildren, ReactNode, useCallback } from 'react'
import { getBlockExploreLink, getBlockExploreName } from 'utils'
import { wrappedCurrency } from 'utils/wrappedCurrency'
import AddToWalletButton, { AddToWalletTextOptions } from '../AddToWallet/AddToWalletButton'

export function TransactionSubmittedContent({
  chainId,
  hash,
  currencyToAdd,
}: {
  hash: string | undefined
  chainId: ChainId
  currencyToAdd?: Currency | undefined
}) {
  const { t } = useTranslation()

  const token: Token | undefined = wrappedCurrency(currencyToAdd, chainId)

  return (
    <div className="w-full flex flex-col items-center">
      <ArrowCircleUp size={80} className="text-on-surface" />

      <div className="flex flex-col items-center space-y-3 mt-6">
        <p className="text-on-surface">{t('Transaction Submitted')}</p>
        {chainId && hash && (
          <ExternalLink href={getBlockExploreLink(hash, 'transaction')}>
            {t('View on {{site}}', {
              site: getBlockExploreName(),
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
          />
        )}
      </div>
    </div>
  )
}

interface ConfirmationModalProps {
  title: string
  customOnDismiss?: () => void
  hash: string | undefined
  errorMessage?: string
  content: ReactNode
  attemptingTxn: boolean
  pendingText: string
  currencyToAdd?: Currency | undefined
}

const TransactionConfirmationModal: FC<PropsWithChildren<InjectedModalProps & ConfirmationModalProps & ModalProps>> = ({
  title,
  onDismiss,
  customOnDismiss,
  attemptingTxn,
  errorMessage,
  hash,
  pendingText,
  content,
  currencyToAdd,
  maxWidth = 'max-w-md',
  ...props
}) => {
  const { qrUri, requestKey, cancelKlipRequest } = useA2AConnectorQRUri()
  const { chainId } = useActiveChainId()

  const handleDismiss = useCallback(async () => {
    if (customOnDismiss) {
      customOnDismiss()
    }

    onDismiss?.()

    if (requestKey) {
      cancelKlipRequest()
    }
  }, [customOnDismiss, onDismiss, requestKey, cancelKlipRequest])

  if (!chainId) return null

  return (
    <Modal title={title} {...props} onDismiss={handleDismiss} maxWidth={maxWidth}>
      {attemptingTxn ? (
        <ConfirmationPendingContent qrUri={qrUri} pendingText={pendingText} />
      ) : hash ? (
        <TransactionSubmittedContent chainId={chainId} hash={hash} currencyToAdd={currencyToAdd} />
      ) : errorMessage ? (
        <TransactionErrorContent message={errorMessage} onDismiss={handleDismiss} />
      ) : (
        content
      )}
    </Modal>
  )
}

export default TransactionConfirmationModal
