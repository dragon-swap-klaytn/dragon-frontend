import { useTranslation } from '@pancakeswap/localization'
import { ButtonV2, CheckboxV2, InjectedModalProps, Modal, Notification } from '@pancakeswap/uikit'
import { useState } from 'react'

interface ExpertModalProps extends InjectedModalProps {
  setShowConfirmExpertModal: (show: boolean) => void
  setShowExpertModeAcknowledgement: (show: boolean) => void
  toggleExpertMode: () => void
}

export const ExpertModal: React.FC<React.PropsWithChildren<ExpertModalProps>> = ({
  setShowConfirmExpertModal,
  setShowExpertModeAcknowledgement,
  toggleExpertMode,
}) => {
  const [isRememberChecked, setIsRememberChecked] = useState(false)

  const { t } = useTranslation()

  return (
    <Modal
      title={t('Expert Mode')}
      onBack={() => setShowConfirmExpertModal(false)}
      onDismiss={() => setShowConfirmExpertModal(false)}
    >
      <div className="flex flex-col space-y-4">
        <Notification variant="caution">
          <p>
            {t(
              "Expert mode turns off the 'Confirm' transaction prompt, and allows high slippage trades that often result in bad rates and lost funds.",
            )}
          </p>
        </Notification>

        <p className="text-sm text-on-surface">{t('Only use this mode if you know what you’re doing.')}</p>

        <div className="flex items-center space-x-2">
          <CheckboxV2
            id="export-modal-checkbox"
            checked={isRememberChecked}
            onChange={() => setIsRememberChecked(!isRememberChecked)}
            label={t('Don’t show this again')}
            labelClassName="text-sm text-on-surface-subtle"
          />
        </div>

        <ButtonV2
          variant="primary"
          onClick={() => {
            // eslint-disable-next-line no-alert
            if (window.prompt(`Please type the word "confirm" to enable expert mode.`) === 'confirm') {
              toggleExpertMode()
              setShowConfirmExpertModal(false)
              if (isRememberChecked) {
                setShowExpertModeAcknowledgement(false)
              }
            }
          }}
        >
          {t('Turn On Expert Mode')}
        </ButtonV2>

        <ButtonV2 variant="subtle" onClick={() => setShowConfirmExpertModal(false)}>
          {t('Cancel')}
        </ButtonV2>
      </div>
    </Modal>
  )
}
