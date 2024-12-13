import { useTranslation } from '@pancakeswap/localization'
import { TransactionErrorContent } from '@pancakeswap/widgets-internal'
import { ArrowSquareOut } from '@phosphor-icons/react'
import { useCallback } from 'react'

const PancakeRouterSlippageErrorMsg =
  'This transaction will not succeed either due to price movement or fee on transfer. Try increasing your slippage tolerance.'

export const SwapTransactionErrorContent = ({ onDismiss, message, openSettingModal }) => {
  const isSlippagedErrorMsg = message?.includes(PancakeRouterSlippageErrorMsg)

  const handleErrorDismiss = useCallback(() => {
    onDismiss?.()
    if (isSlippagedErrorMsg && openSettingModal) {
      openSettingModal()
    }
  }, [isSlippagedErrorMsg, onDismiss, openSettingModal])
  const { t } = useTranslation()

  return isSlippagedErrorMsg ? (
    <TransactionErrorContent
      message={
        <>
          <p className="text-sm mb-3">
            {t(
              'This transaction will not succeed either due to price movement or fee on transfer. Try increasing your',
            )}
            &nbsp;
            <button
              type="button"
              className="hover:opacity-70 inline-block underline underline-offset-2"
              onClick={handleErrorDismiss}
            >
              {t('slippage tolerance.')}
            </button>
          </p>

          <a
            href="https://docs.dgswap.io/products/how-to-trade"
            target="_blank"
            rel="noreferrer"
            className="hover:opacity-70 text-sm underline underline-offset-2"
          >
            <span>{t('What are the potential issues with the token?')}</span>

            <ArrowSquareOut size={20} className="inline-block ml-1" />
          </a>
        </>
      }
    />
  ) : (
    <TransactionErrorContent message={message} onDismiss={onDismiss} />
  )
}
