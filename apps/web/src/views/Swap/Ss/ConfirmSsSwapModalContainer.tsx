import { useTranslation } from '@pancakeswap/localization'
import { BoxProps, Modal, useTooltip } from '@pancakeswap/uikit'
import { ArrowClockwiseIcon } from '@phosphor-icons/react'
import clsx from 'clsx'
import { QuoteResponse } from 'pages/api/ss/quote'
import { PropsWithChildren } from 'react'
import { KeyedMutator } from 'swr'

interface ConfirmSsSwapModalContainerProps extends BoxProps {
  title?: string
  handleDismiss: () => void
  refreshQuote: KeyedMutator<QuoteResponse>
  refreshing?: boolean
}

const ConfirmSsSwapModalContainer: React.FC<PropsWithChildren<ConfirmSsSwapModalContainerProps>> = ({
  title,
  children,
  handleDismiss,
  refreshQuote,
  refreshing = false,
}) => {
  const { t } = useTranslation()

  return (
    <Modal
      title={title || t('Confirm Swap')}
      onDismiss={handleDismiss}
      maxWidth="max-w-sm"
      headerRightSlot={<RefreshButton refreshQuote={refreshQuote} refreshing={refreshing} />}
    >
      {children}
    </Modal>
  )
}

export default ConfirmSsSwapModalContainer

function RefreshButton({
  refreshQuote,
  refreshing = false,
}: {
  refreshQuote: KeyedMutator<QuoteResponse>
  refreshing: boolean
}) {
  const { t } = useTranslation()
  const { targetRef, tooltip, tooltipVisible } = useTooltip(
    <p className="text-sm break-keep">{t('Refresh quote')}</p>,
    {
      placement: 'bottom',
    },
  )

  return (
    <button
      type="button"
      ref={targetRef}
      onClick={() => refreshQuote()}
      className={clsx('text-primary hover:opacity-70', {
        'animate-spin-fast': refreshing,
      })}
    >
      <ArrowClockwiseIcon size={16} />

      {tooltipVisible && tooltip}
    </button>
  )
}
