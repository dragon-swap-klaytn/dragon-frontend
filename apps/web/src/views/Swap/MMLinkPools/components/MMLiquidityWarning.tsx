import { useTranslation } from '@pancakeswap/localization'
import { Alert } from '@pancakeswap/uikit'

export const MMLiquidityWarning: React.FC = () => {
  const { t } = useTranslation()
  return <Alert title={t('MMs are temporarily unable to facilitate trades. Please try again later')} variant="info" />
}
