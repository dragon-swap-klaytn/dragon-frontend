import { useTranslation } from '@pancakeswap/localization'
import { memo } from 'react'

import { useSwapState } from 'state/swap/hooks'
import { useSwapActionHandlers } from 'state/swap/useSwapActionHandlers'

import { ArrowCircleDown } from '@phosphor-icons/react'
import Button from 'components/Common/Button'
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
        <Button variant="subtle" fullWidth onClick={() => onChangeRecipient(null)}>
          {t('Remove send')}
        </Button>
      </div>
      <AddressInputPanel id="recipient" value={recipient} onChange={onChangeRecipient} />
    </>
  )
})
