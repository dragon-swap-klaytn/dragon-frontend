import { InjectedModalProps, Modal, ModalProps } from '@pancakeswap/uikit'
import { ConfirmationPendingContent } from '@pancakeswap/widgets-internal'
import useA2AConnectorQRUri from 'hooks/useA2AConnectorQRUri'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { useCallback } from 'react'

interface ConfirmationModalProps {
  title: string
  customOnDismiss?: () => void
  hash: string | undefined
  errorMessage?: string
  content: () => React.ReactNode
  attemptingTxn: boolean
  pendingText?: string
}

const ApprovalConfirmationModal: React.FC<
  React.PropsWithChildren<InjectedModalProps & ConfirmationModalProps & ModalProps>
> = ({ title, onDismiss, customOnDismiss, attemptingTxn, errorMessage, hash, content, pendingText, ...props }) => {
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
    <Modal title={title} headerBackground="gradientCardHeader" {...props} onDismiss={handleDismiss}>
      {attemptingTxn ? (
        <ConfirmationPendingContent qrUri={qrUri} pendingText={pendingText || 'wating approve...'} />
      ) : (
        content()
      )}
    </Modal>
  )
}

export default ApprovalConfirmationModal
