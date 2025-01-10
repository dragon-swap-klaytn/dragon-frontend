import { useTranslation } from '@pancakeswap/localization'
import { memo } from 'react'

import { useSwapState } from 'state/swap/hooks'
import { useSwapActionHandlers } from 'state/swap/useSwapActionHandlers'

import { ButtonV2 } from '@pancakeswap/uikit'
import { ArrowCircleDown } from '@phosphor-icons/react'
import AddressInputPanel from '../../components/AddressInputPanel'
import { useAllowRecipient } from '../hooks'

export const Recipient = memo(function Recipient() {
  const { t } = useTranslation()
  const { recipient } = useSwapState()
  const { onChangeRecipient } = useSwapActionHandlers()
  const allowRecipient = useAllowRecipient()

  if (!allowRecipient || recipient === null) {
    return null
  }

  return (
    <>
      <div className="flex items-center space-x-2">
        <ArrowCircleDown size={24} className="text-gray-50" />
        <ButtonV2 variant="subtle" fullWidth onClick={() => onChangeRecipient(null)}>
          {t('Remove send')}
        </ButtonV2>
      </div>
      <AddressInputPanel value={recipient} onChange={onChangeRecipient} />
    </>
  )
})
