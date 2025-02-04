import { useTranslation } from '@pancakeswap/localization'
import { InjectedModalProps, Modal, QuestionHelper, ToggleSwitch, useModal } from '@pancakeswap/uikit'
import { useExpertMode, useUserExpertModeAcknowledgement, useUserSingleHopOnly } from '@pancakeswap/utils/user'
import { CaretRight } from '@phosphor-icons/react'
import clsx from 'clsx'
import SlippageTabs from 'components/Menu/GlobalSettings/TransactionSettings'
import { ExpertModal } from 'components/Modal/ExpertModal'
import { PropsWithChildren, ReactNode, useCallback, useState } from 'react'
import { useSwapActionHandlers } from 'state/swap/useSwapActionHandlers'
import {
  useOnlyOneAMMSourceEnabled,
  useRoutingSettingChanged,
  useUserSplitRouteEnable,
  useUserV2SwapEnable,
  useUserV3SwapEnable,
} from 'state/user/smartRouter'
import { SettingsMode } from './types'

export const withCustomOnDismiss =
  (Component) =>
  ({
    onDismiss,
    customOnDismiss,
    mode,
    ...props
  }: {
    onDismiss?: () => void
    customOnDismiss: () => void
    mode: SettingsMode
  }) => {
    const handleDismiss = useCallback(() => {
      onDismiss?.()
      if (customOnDismiss) {
        customOnDismiss()
      }
    }, [customOnDismiss, onDismiss])

    return <Component {...props} mode={mode} onDismiss={handleDismiss} />
  }

const SettingsModal: React.FC<React.PropsWithChildren<InjectedModalProps>> = ({ onDismiss, mode }) => {
  const [showConfirmExpertModal, setShowConfirmExpertModal] = useState(false)
  const [showExpertModeAcknowledgement, setShowExpertModeAcknowledgement] = useUserExpertModeAcknowledgement()
  const [expertMode, setExpertMode] = useExpertMode()

  const { onChangeRecipient } = useSwapActionHandlers()

  const { t } = useTranslation()

  const handleExpertModeToggle = useCallback(() => {
    if (expertMode || !showExpertModeAcknowledgement) {
      onChangeRecipient(null)
      setExpertMode((s) => !s)
    } else {
      setShowConfirmExpertModal(true)
    }
  }, [expertMode, onChangeRecipient, setExpertMode, setShowConfirmExpertModal, showExpertModeAcknowledgement])

  if (showConfirmExpertModal) {
    return (
      <ExpertModal
        setShowConfirmExpertModal={setShowConfirmExpertModal}
        onDismiss={onDismiss}
        toggleExpertMode={() => setExpertMode((s) => !s)}
        setShowExpertModeAcknowledgement={setShowExpertModeAcknowledgement}
      />
    )
  }

  return (
    <Modal title={t('Settings')} onDismiss={onDismiss} maxWidth="max-w-[400px]">
      <div className="flex flex-col max-h-[90vh] md:max-h-none">
        {mode === SettingsMode.SWAP_LIQUIDITY && (
          <>
            <SlippageTabs />

            <SettingWrapper>
              <SettingTitle
                title={t('Expert Mode')}
                questionHelperText={t(
                  'Bypasses confirmation modals and allows high slippage trades. Use at your own risk.',
                )}
              />

              <ToggleSwitch activated={expertMode} setActivated={handleExpertModeToggle} />
            </SettingWrapper>

            <RoutingSettingsButton />
          </>
        )}
      </div>
    </Modal>
  )
}

export default SettingsModal

export function RoutingSettingsButton({ showRedDot = true }: { showRedDot?: boolean }) {
  const { t } = useTranslation()
  const [isRoutingSettingChange] = useRoutingSettingChanged()

  const [onPresentRoutingSettings] = useModal(<RoutingSettings />)

  return (
    <SettingWrapper>
      <button
        type="button"
        className="flex items-center justify-between w-full hover:opacity-70"
        onClick={onPresentRoutingSettings}
      >
        <div className="relative">
          <SettingTitle title={t('Customize Routing')} />

          <div
            className={clsx('absolute -top-0.5 -right-2 w-2 h-2 bg-red-600 rounded-full', {
              hidden: !isRoutingSettingChange || !showRedDot,
            })}
          />
        </div>

        <CaretRight size={20} className="text-on-surface" />
      </button>
    </SettingWrapper>
  )
}

export function RoutingSettings({ hideOnback = false }: { hideOnback?: boolean }) {
  const { t } = useTranslation()

  // const [isStableSwapByDefault, setIsStableSwapByDefault] = useUserStableSwapEnable()
  const [v2Enable, setV2Enable] = useUserV2SwapEnable()
  const [v3Enable, setV3Enable] = useUserV3SwapEnable()
  const [split, setSplit] = useUserSplitRouteEnable()
  // const [isMMLinkedPoolByDefault, setIsMMLinkedPoolByDefault] = useMMLinkedPoolByDefault()
  const [singleHopOnly, setSingleHopOnly] = useUserSingleHopOnly()
  const onlyOneAMMSourceEnabled = useOnlyOneAMMSourceEnabled()
  const [isRoutingSettingChange, reset] = useRoutingSettingChanged()

  const [onPresentSettingsModal] = useModal(<SettingsModal mode={SettingsMode.SWAP_LIQUIDITY} />)

  return (
    <Modal
      title={t('Customize Routing')}
      headerRightSlot={
        isRoutingSettingChange && (
          <button type="button" onClick={reset} className="text-sm hover:opacity-70 text-on-surface-subtle">
            {t('Reset')}
          </button>
        )
      }
      onBack={!hideOnback ? onPresentSettingsModal : undefined}
    >
      <h3 className="text-on-surface-brand text-xs">{t('Liquidity source')}</h3>

      <SettingWrapper>
        <div className="flex items-center justify-between w-full">
          <SettingTitle
            title="DragonSwap V3"
            questionHelperText={t(
              'V3 offers concentrated liquidity to provide deeper liquidity for traders with the same amount of capital, offering lower slippage and more flexible trading fee tiers.',
            )}
          />

          <ToggleSwitch
            activated={v3Enable}
            setActivated={(checked) => setV3Enable(checked)}
            disabled={v3Enable && onlyOneAMMSourceEnabled}
          />
        </div>
      </SettingWrapper>

      <SettingWrapper>
        <div className="flex items-center justify-between w-full">
          <SettingTitle
            title="DragonSwap V2"
            questionHelperText={
              <div className="text-sm">
                <p>{t('The previous V2 exchange is where a number of iconic, popular assets are traded.')}</p>
                <p className="mt-4">{t('Recommend leaving this on to ensure backward compatibility.')}</p>
              </div>
            }
          />

          <ToggleSwitch
            activated={v2Enable}
            setActivated={(checked) => setV2Enable(checked)}
            disabled={v2Enable && onlyOneAMMSourceEnabled}
          />
        </div>
      </SettingWrapper>

      <h3 className="text-on-surface-brand text-xs mt-8">{t('Routing preference')}</h3>

      <SettingWrapper>
        <div className="flex items-center justify-between w-full">
          <SettingTitle
            title="Allow Multihops"
            questionHelperText={
              <div className="text-sm">
                <p>
                  {t(
                    'Multihops enables token swaps through multiple hops between several pools to achieve the best deal.',
                  )}
                </p>
                <p className="mt-4">
                  {t(
                    'Turning this off will only allow direct swap, which may cause higher slippage or even fund loss.',
                  )}
                </p>
              </div>
            }
          />

          <ToggleSwitch
            activated={!singleHopOnly}
            setActivated={(checked) => setSingleHopOnly(!checked)}
            // disabled={v3Enable && onlyOneAMMSourceEnabled}
          />
        </div>
      </SettingWrapper>

      <SettingWrapper>
        <div className="flex items-center justify-between w-full">
          <SettingTitle
            title="Allow Split Routing"
            questionHelperText={
              <div className="text-sm">
                <p>
                  {t('Split routing enables token swaps to be broken into multiple routes to achieve the best deal.')}
                </p>
                <p className="mt-4">
                  {t(
                    'Turning this off will only allow a single route, which may result in low efficiency or higher slippage.',
                  )}
                </p>
              </div>
            }
          />

          <ToggleSwitch
            activated={split}
            setActivated={(checked) => setSplit(checked)}
            // disabled={v3Enable && onlyOneAMMSourceEnabled}
          />
        </div>
      </SettingWrapper>
    </Modal>
  )
}

export function SettingWrapper({ children }: PropsWithChildren) {
  return <div className="flex items-center justify-between py-3">{children}</div>
}

export function SettingTitle({ title, questionHelperText }: { title: string; questionHelperText?: ReactNode }) {
  return (
    <div className="flex items-center space-x-1">
      <h4 className="text-sm whitespace-nowrap text-on-surface">{title}</h4>
      {questionHelperText && <QuestionHelper text={questionHelperText} placement="top" ml="4px" />}
    </div>
  )
}
