import { InjectedModalProps, Modal, ModalProps } from '@pancakeswap/uikit'
import { ConfirmationPendingContent } from '@pancakeswap/widgets-internal'
import useA2AConnectorQRUri from 'hooks/useA2AConnectorQRUri'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { useTranslation } from 'next-i18next'
import { useCallback } from 'react'

interface ConfirmationModalProps {
  title: string
  customOnDismiss?: () => void
  content: () => React.ReactNode
  attemptingTxn: boolean
  pendingText?: string
}

const ApprovalConfirmationModal: React.FC<
  React.PropsWithChildren<InjectedModalProps & ConfirmationModalProps & ModalProps>
> = ({ title, onDismiss, customOnDismiss, attemptingTxn, content, pendingText, ...props }) => {
  const { t } = useTranslation()
  const { requestKey, cancelKlipRequest, qrUri } = useA2AConnectorQRUri()

  const { chainId } = useActiveChainId()

  const handleDismiss = useCallback(() => {
    if (customOnDismiss) {
      customOnDismiss()
    }

    onDismiss?.()

    if (requestKey) {
      cancelKlipRequest()
    }
  }, [customOnDismiss, onDismiss, cancelKlipRequest, requestKey])

  if (!chainId) return null

  return (
    <Modal title={title} {...props} onDismiss={handleDismiss}>
      {attemptingTxn ? (
        <ConfirmationPendingContent qrUri={qrUri} pendingText={pendingText ? t(pendingText) : t('wating approve...')} />
      ) : (
        content()
      )}
    </Modal>
  )
}

export default ApprovalConfirmationModal
