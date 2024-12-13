import { NotificationDot, useModal } from '@pancakeswap/uikit'
import { useExpertMode } from '@pancakeswap/utils/user'
import { ArrowClockwise, ClockCounterClockwise } from '@phosphor-icons/react'
import clsx from 'clsx'
import TransactionsModal from 'components/App/Transactions/TransactionsModal'
import GlobalSettings from 'components/Menu/GlobalSettings'
import { memo, MouseEventHandler, PropsWithChildren, ReactElement } from 'react'
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
        <h4 className="text-xl text-white">{title}</h4>
        <p className="text-[13px] mt-1.5 text-on-surface-tertiary">{subtitle}</p>

        <div className="flex w-full justify-end items-center">
          <SettingButton onClick={onRefresh} disabled={syncing || refreshDisabled}>
            <ArrowClockwise
              size={24}
              className={clsx('text-on-surface-tertiary', {
                'animate-spin-fast': !refreshDisabled && syncing,
              })}
            />
          </SettingButton>

          <SettingButton onClick={onPresentTransactionsModal}>
            <ClockCounterClockwise size={24} className="text-on-surface-tertiary" />
          </SettingButton>

          <NotificationDot show={expertMode || isRoutingSettingChange}>
            <GlobalSettings color="textSubtle" mr="0" mode={SettingsMode.SWAP_LIQUIDITY} />
          </NotificationDot>
        </div>
      </div>
    )
  },
)

export default CurrencyInputHeader

function SettingButton({
  children,
  onClick,
  disabled = false,
}: PropsWithChildren<{ onClick: MouseEventHandler<HTMLButtonElement>; disabled?: boolean }>) {
  return (
    <button
      type="button"
      className={clsx('p-2 rounded-full disabled:cursor-not-allowed', {
        'hover:bg-overlay-surface-hover-light': !disabled,
        'opacity-50': disabled,
      })}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}
