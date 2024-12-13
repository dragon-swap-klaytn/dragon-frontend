import { useTranslation } from '@pancakeswap/localization'
import { ButtonProps, Flex, InjectedModalProps, Modal, ModalV2, QuestionHelper } from '@pancakeswap/uikit'
import {
  useAudioPlay,
  useExpertMode,
  useUserExpertModeAcknowledgement,
  useUserSingleHopOnly,
} from '@pancakeswap/utils/user'
// import { ExpertModal } from '@pancakeswap/widgets-internal'
import { CaretRight } from '@phosphor-icons/react'
import clsx from 'clsx'
import ToggleSwitch from 'components/Common/ToggleSwitch'
import SlippageTabs from 'components/Menu/GlobalSettings/TransactionSettings'
import { ExpertModal } from 'components/Modal/ExpertModal'
import { useActiveChainId } from 'hooks/useActiveChainId'
import useTheme from 'hooks/useTheme'
import { useWebNotifications } from 'hooks/useWebNotifications'
import { PropsWithChildren, ReactNode, lazy, useCallback, useState } from 'react'
import { useSwapActionHandlers } from 'state/swap/useSwapActionHandlers'
import { useSubgraphHealthIndicatorManager, useUserUsernameVisibility } from 'state/user/hooks'
import { useUserTokenRisk } from 'state/user/hooks/useUserTokenRisk'
import { useMMLinkedPoolByDefault } from 'state/user/mmLinkedPool'
import {
  useOnlyOneAMMSourceEnabled,
  useRoutingSettingChanged,
  useUserSplitRouteEnable,
  useUserStableSwapEnable,
  useUserV2SwapEnable,
  useUserV3SwapEnable,
} from 'state/user/smartRouter'
import { styled } from 'styled-components'
import { SettingsMode } from './types'

const WebNotiToggle = lazy(() => import('./WebNotiToggle'))

const BetaTag = styled.div`
  border: 2px solid ${({ theme }) => theme.colors.success};
  border-radius: 16px;
  padding-left: 6px;
  padding-right: 6px;
  padding-top: 3px;
  padding-bottom: 3px;
  color: ${({ theme }) => theme.colors.success};
  margin-left: 6px;
  font-weight: bold;
  font-size: 14px;
`
const ScrollableContainer = styled(Flex)`
  flex-direction: column;
  height: auto;
  ${({ theme }) => theme.mediaQueries.xs} {
    max-height: 90vh;
  }
  ${({ theme }) => theme.mediaQueries.md} {
    max-height: none;
  }
`

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
  const [audioPlay, setAudioMode] = useAudioPlay()
  const [subgraphHealth, setSubgraphHealth] = useSubgraphHealthIndicatorManager()
  const [userUsernameVisibility, setUserUsernameVisibility] = useUserUsernameVisibility()
  const { enabled } = useWebNotifications()

  const { onChangeRecipient } = useSwapActionHandlers()
  const { chainId } = useActiveChainId()
  const [tokenRisk, setTokenRisk] = useUserTokenRisk()

  const { t } = useTranslation()
  const { isDark, setTheme } = useTheme()

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
      {/* const ScrollableContainer = styled(Flex)`
  flex-direction: column;
  height: auto;
  ${({ theme }) => theme.mediaQueries.xs} {
    max-height: 90vh;
  }
  ${({ theme }) => theme.mediaQueries.md} {
    max-height: none;
  }
` */}
      <div className="flex flex-col max-h-[90vh] md:max-h-none">
        {mode === SettingsMode.SWAP_LIQUIDITY && (
          <>
            {/* <h3 className="text-white font-bold text-lg">{t('Swaps & Liquidity')}</h3> */}
            {/* <Flex justifyContent="space-between" alignItems="center" mb="24px">
              {chainId === ChainId.BSC && <GasSettings />}
            </Flex> */}
            <SlippageTabs />

            {/* <Flex justifyContent="space-between" alignItems="center" mb="24px"> */}
            <SettingWrapper>
              {/* <Flex alignItems="center"> */}
              <SettingTitle
                title={t('Expert Mode')}
                questionHelperText={t(
                  'Bypasses confirmation modals and allows high slippage trades. Use at your own risk.',
                )}
              />
              {/* <div className="flex items-center space-x-1">
                <span>{t('Expert Mode')}</span>
                <QuestionHelper
                  text={t('Bypasses confirmation modals and allows high slippage trades. Use at your own risk.')}
                  placement="top"
                  ml="4px"
                />
              </div> */}
              {/* <Toggle
              id="toggle-expert-mode-button"
              scale="md"
              checked={expertMode}
              onChange={handleExpertModeToggle}
            /> */}
              <ToggleSwitch activated={expertMode} setActivated={handleExpertModeToggle} />
            </SettingWrapper>
            {/* <Flex justifyContent="space-between" alignItems="center" mb="24px">
            <Flex alignItems="center">
              <Text>{t('Flippy sounds')}</Text>
              <QuestionHelper
                text={t('Fun sounds to make a truly immersive pancake-flipping trading experience')}
                placement="top"
                ml="4px"
              />
            </Flex>
            <PancakeToggle checked={audioPlay} onChange={() => setAudioMode((s) => !s)} scale="md" />
          </Flex> */}
            <RoutingSettingsButton />
          </>
        )}
      </div>
    </Modal>
  )
}

export default SettingsModal

export function RoutingSettingsButton({
  children,
  showRedDot = true,
  buttonProps,
}: // className,
{
  children?: ReactNode
  showRedDot?: boolean
  buttonProps?: ButtonProps
  // className?: string
}) {
  const [show, setShow] = useState(false)
  const { t } = useTranslation()
  const [isRoutingSettingChange] = useRoutingSettingChanged()
  return (
    <SettingWrapper>
      <button
        type="button"
        className="flex items-center justify-between w-full hover:opacity-70"
        onClick={() => setShow(true)}
      >
        <div className="relative">
          <SettingTitle title={t('Customize Routing')} />

          <div
            className={clsx('absolute -top-0.5 -right-2 w-2 h-2 bg-red-400 rounded-full', {
              hidden: !isRoutingSettingChange || !showRedDot,
            })}
          />
          {/* <Button variant="text" onClick={() => setShow(true)} scale="sm" {...buttonProps}>
            <p style={{ color: '#1A8AE5' }}>{children || t('Customize Routing')}</p>
          </Button> */}
        </div>

        <CaretRight size={20} />
      </button>

      <ModalV2 isOpen={show} onDismiss={() => setShow(false)} closeOnOverlayClick>
        <RoutingSettings />
      </ModalV2>
    </SettingWrapper>
  )
}

export function RoutingSettings() {
  const { t } = useTranslation()

  const [isStableSwapByDefault, setIsStableSwapByDefault] = useUserStableSwapEnable()
  const [v2Enable, setV2Enable] = useUserV2SwapEnable()
  const [v3Enable, setV3Enable] = useUserV3SwapEnable()
  const [split, setSplit] = useUserSplitRouteEnable()
  const [isMMLinkedPoolByDefault, setIsMMLinkedPoolByDefault] = useMMLinkedPoolByDefault()
  const [singleHopOnly, setSingleHopOnly] = useUserSingleHopOnly()
  const onlyOneAMMSourceEnabled = useOnlyOneAMMSourceEnabled()
  const [isRoutingSettingChange, reset] = useRoutingSettingChanged()

  return (
    <Modal
      title={t('Customize Routing')}
      headerRightSlot={
        isRoutingSettingChange && (
          <button type="button" onClick={reset} className="text-sm hover:opacity-70">
            {t('Reset')}
          </button>
        )
      }
    >
      {/* <AutoColumn
        width={{
          xs: '100%',
          md: 'screenSm',
        }}
        gap="16px"
      > */}

      {/* <PreTitle mb="24px">{t('Liquidity source')}</PreTitle> */}
      <h3 className="text-orange-400 text-xs mt-5">{t('Liquidity source')}</h3>

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

      {/* 
      <SettingWrapper>
        <Flex alignItems="center">
          <Text>DragonSwap V2</Text>
          <QuestionHelper
            text={
              <Flex flexDirection="column">
                <Text mr="5px">
                  {t('The previous V2 exchange is where a number of iconic, popular assets are traded.')}
                </Text>
                <Text mr="5px" mt="1em">
                  {t('Recommend leaving this on to ensure backward compatibility.')}
                </Text>
              </Flex>
            }
            placement="top"
            ml="4px"
          />
        </Flex>
        <Toggle
          disabled={v2Enable && onlyOneAMMSourceEnabled}
          scale="md"
          checked={v2Enable}
          onChange={() => setV2Enable((s) => !s)}
        />
      </SettingWrapper> */}
      {/*
          <Flex justifyContent="space-between" alignItems="center" mb="24px">
            <Flex alignItems="center">
              <Text>PancakeSwap {t('StableSwap')}</Text>
              <QuestionHelper
                text={
                  <Flex flexDirection="column">
                    <Text mr="5px">
                      {t(
                        'StableSwap provides higher efficiency for stable or pegged assets and lower fees for trades.',
                      )}
                    </Text>
                  </Flex>
                }
                placement="top"
                ml="4px"
              />
            </Flex>
            <PancakeToggle
              disabled={isStableSwapByDefault && onlyOneAMMSourceEnabled}
              id="stable-swap-toggle"
              scale="md"
              checked={isStableSwapByDefault}
              onChange={() => {
                setIsStableSwapByDefault((s) => !s)
              }}
            />
          </Flex>
          */}
      {/* <Flex justifyContent="space-between" alignItems="center" mb="24px">
        <Flex alignItems="center">
          <Text>{`DragonSwap ${t('MM Linked Pool')}`}</Text>
          <QuestionHelper
            text={
              <Flex flexDirection="column">
                <Text mr="5px">{t('Trade through the market makers if they provide better deal')}</Text>
                <Text mr="5px" mt="1em">
                  {t(
                    'If a trade is going through market makers, it will no longer route through any traditional AMM DEX pools.',
                  )}
                </Text>
              </Flex>
            }
            placement="top"
            ml="4px"
          />
        </Flex>
        <Toggle
          id="toggle-disable-mm-button"
          checked={isMMLinkedPoolByDefault}
          onChange={(e) => setIsMMLinkedPoolByDefault(e.target.checked)}
          scale="md"
        />
      </Flex> */}
      {/* {onlyOneAMMSourceEnabled && (
        <Message variant="warning">
          <MessageText>
            {t('At least one AMM liquidity source has to be enabled to support normal trading.')}
          </MessageText>
        </Message>
      )} */}

      <h3 className="text-orange-400 text-xs mt-5">{t('Routing preference')}</h3>

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

      {/* <AutoRow alignItems="center" mb="24px">
        <RowFixed as="label" gap="16px">
          <Checkbox
            id="toggle-disable-multihop-button"
            checked={!singleHopOnly}
            scale="sm"
            onChange={() => {
              setSingleHopOnly((s) => !s)
            }}
          />
          <Text>{t('Allow Multihops')}</Text>
        </RowFixed>
        <QuestionHelper
          text={
            <Flex flexDirection="column">
              <Text mr="5px" />
              <Text mr="5px" mt="1em">
                {t(
                  'Multihops enables token swaps through multiple hops between several pools to achieve the best deal.',
                )}
                {t('Turning this off will only allow direct swap, which may cause higher slippage or even fund loss.')}
              </Text>
            </Flex>
          }
          placement="top"
          ml="4px"
        />
      </AutoRow> */}

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

      {/* <AutoRow alignItems="center" mb="24px">
        <RowFixed alignItems="center" as="label" gap="16px">
          <Checkbox
            id="toggle-disable-multihop-button"
            checked={split}
            scale="sm"
            onChange={() => {
              setSplit((s) => !s)
            }}
          />
          <Text>{t('Allow Split Routing')}</Text>
        </RowFixed>
        <QuestionHelper
          text={
            <Flex flexDirection="column">
              <Text mr="5px" />
              <Text mr="5px" mt="1em">
                {t('Split routing enables token swaps to be broken into multiple routes to achieve the best deal.')}
                {t(
                  'Turning this off will only allow a single route, which may result in low efficiency or higher slippage.',
                )}
              </Text>
            </Flex>
          }
          placement="top"
          ml="4px"
        />
      </AutoRow> */}

      {/* </AutoColumn> */}
    </Modal>
  )
}

export function SettingWrapper({ children }: PropsWithChildren) {
  return <div className="flex items-center justify-between py-3">{children}</div>
}

export function SettingTitle({ title, questionHelperText }: { title: string; questionHelperText?: ReactNode }) {
  return (
    <div className="flex items-center space-x-1">
      <h4 className="text-sm whitespace-nowrap">{title}</h4>
      {questionHelperText && <QuestionHelper text={questionHelperText} placement="top" ml="4px" />}
    </div>
  )
}
