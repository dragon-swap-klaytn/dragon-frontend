import { useTranslation } from '@pancakeswap/localization'
import { BoxProps, Modal } from '@pancakeswap/uikit'
import { PropsWithChildren } from 'react'

interface ConfirmSwapModalContainerProps extends BoxProps {
  title?: string
  handleDismiss: () => void
}

const ConfirmSwapModalContainer: React.FC<PropsWithChildren<ConfirmSwapModalContainerProps>> = ({
  title,
  children,
  handleDismiss,
}) => {
  const { t } = useTranslation()

  return (
    <Modal title={title || t('Confirm Swap')} onDismiss={handleDismiss}>
      {children}
    </Modal>
  )
}

export default ConfirmSwapModalContainer
