import { useTranslation } from '@pancakeswap/localization'
import { InjectedModalProps, Modal } from '@pancakeswap/uikit'
import Button from 'components/Common/Button'
import Checkbox from 'components/Common/Checkbox'
import Notification from 'components/Common/Notification'
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
      headerBackground="gradientCardHeader"
      width={['100%', '100%', '100%', '436px']}
    >
      <div className="flex flex-col space-y-4 mt-4">
        <Notification variant="caution">
          <p>
            {t(
              "Expert mode turns off the 'Confirm' transaction prompt, and allows high slippage trades that often result in bad rates and lost funds.",
            )}
          </p>
        </Notification>

        <p className="text-sm">{t('Only use this mode if you know what you’re doing.')}</p>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="export-modal-checkbox"
            checked={isRememberChecked}
            onChange={() => setIsRememberChecked(!isRememberChecked)}
          />
          <label
            htmlFor="export-modal-checkbox"
            className="text-sm text-on-surface-secondary cursor-pointer hover:opacity-70"
          >
            {t('Don’t show this again')}
          </label>
        </div>

        <Button
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
        </Button>

        <Button variant="subtle" onClick={() => setShowConfirmExpertModal(false)}>
          {t('Cancel')}
        </Button>
      </div>
    </Modal>
  )
}
