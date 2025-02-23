import { MenuIconButton, NotificationDot, useModal } from '@pancakeswap/uikit'
import { useExpertMode } from '@pancakeswap/utils/user'
import { ArrowClockwise, ClockCounterClockwise } from '@phosphor-icons/react'
import clsx from 'clsx'
import TransactionsModal from 'components/App/Transactions/TransactionsModal'
import GlobalSettings from 'components/Menu/GlobalSettings'
import { memo, ReactElement } from 'react'
import { useRoutingSettingChanged } from 'state/user/smartRouter'
import { SettingsMode } from '../../../components/Menu/GlobalSettings/types'

interface Props {
  title: string | ReactElement
  subtitle: string
  refreshDisabled: boolean
  onRefresh: () => Promise<void>
  syncing: boolean
}

const CurrencyInputHeader: React.FC<React.PropsWithChildren<Props>> = memo(
  ({ subtitle, title, refreshDisabled, onRefresh, syncing }) => {
    const [expertMode] = useExpertMode()
    const [isRoutingSettingChange] = useRoutingSettingChanged()
    const [onPresentTransactionsModal] = useModal(<TransactionsModal />)

    return (
      <div className="w-full">
        <h4 className="text-xl text-on-surface">{title}</h4>
        <p className="text-[13px] mt-1.5 text-on-surface-subtlest">{subtitle}</p>

        <div className="flex w-full justify-end items-center">
          <MenuIconButton onClick={onRefresh} disabled={syncing || refreshDisabled}>
            <ArrowClockwise
              size={24}
              className={clsx('text-gray-50', {
                'animate-spin-fast': !refreshDisabled && syncing,
              })}
            />
          </MenuIconButton>

          <MenuIconButton onClick={onPresentTransactionsModal}>
            <ClockCounterClockwise size={24} className="text-gray-50" />
          </MenuIconButton>

          <NotificationDot show={expertMode || isRoutingSettingChange}>
            <GlobalSettings mode={SettingsMode.SWAP_LIQUIDITY} />
          </NotificationDot>
        </div>
      </div>
    )
  },
)

export default CurrencyInputHeader
