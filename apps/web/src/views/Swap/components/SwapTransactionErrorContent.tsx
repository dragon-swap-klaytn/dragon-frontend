import { useTranslation } from '@pancakeswap/localization'
import { ExternalLink } from '@pancakeswap/uikit'
import { TransactionErrorContent } from '@pancakeswap/widgets-internal'
import { useRouter } from 'next/router'
import { useCallback } from 'react'

const PancakeRouterSlippageErrorMsg =
  'This transaction will not succeed either due to price movement or fee on transfer. Try increasing your slippage tolerance.'

export const SwapTransactionErrorContent = ({ onDismiss, message, openSettingModal }) => {
  const { locale } = useRouter()
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

          <ExternalLink
            href={locale === 'ko' ? 'https://docs.dgswap.io/ko/services/swap' : 'https://docs.dgswap.io/services/swap'}
          >
            <span>{t('What are the potential issues with the token?')}</span>
          </ExternalLink>
        </>
      }
    />
  ) : (
    <TransactionErrorContent message={message} onDismiss={onDismiss} />
  )
}
