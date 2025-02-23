import { useTranslation } from '@pancakeswap/localization'
import { FC } from 'react'

import CurrencyInputHeader from '../../components/CurrencyInputHeader'

export const FormHeader: FC<{ refreshDisabled: boolean; onRefresh: () => Promise<void>; syncing: boolean }> = ({
  refreshDisabled,
  onRefresh,
  syncing,
}) => {
  const { t } = useTranslation()

  return (
    <CurrencyInputHeader
      title={t('Swap')}
      subtitle={t('Trade tokens in an instant')}
      refreshDisabled={refreshDisabled}
      onRefresh={onRefresh}
      syncing={syncing}
    />
  )
}
