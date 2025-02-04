import { useTranslation } from '@pancakeswap/localization'
import { MenuIconButton, ToggleSwitch, useModal } from '@pancakeswap/uikit'
import { Gear, Question } from '@phosphor-icons/react'
import clsx from 'clsx'
import LanguageSettings from 'components/Menu/GlobalSettings/LanguageSettings'
import { SettingModeType, SettingsMode } from 'components/Menu/GlobalSettings/types'
import { Dispatch, SetStateAction, useState } from 'react'
import SettingsModal from './SettingsModal'

type Props = {
  mode?: SettingModeType
  globalSettingsOpen?: boolean
  setGlobalSettingsOpen?: Dispatch<SetStateAction<boolean>>
}

const GlobalSettings = ({ mode, globalSettingsOpen, setGlobalSettingsOpen }: Props) => {
  const [onPresentSettingsModal] = useModal(<SettingsModal mode={mode} />)
  const [open, setOpen] = useState(false)
  const [activated, setActivated] = useState(true)
  const { t } = useTranslation()

  return (
    <div className="relative">
      <MenuIconButton
        onClick={
          mode === SettingsMode.GLOBAL
            ? setGlobalSettingsOpen
              ? () => setGlobalSettingsOpen((prev) => !prev)
              : () => setOpen((prev) => !prev)
            : onPresentSettingsModal
        }
      >
        <Gear height={24} width={24} className="text-gray-50" weight="fill" />
      </MenuIconButton>

      <div
        className={clsx(
          'absolute top-[50px] right-0 bg-surface-overlay p-6 rounded-2xl transition-opacity z-50 w-64 xxs:w-80 md:w-[340px]',
          {
            'opacity-100': setGlobalSettingsOpen ? globalSettingsOpen : open,
            'opacity-0 pointer-events-none': setGlobalSettingsOpen ? !globalSettingsOpen : !open,
          },
        )}
      >
        <h3 className="text-on-surface font-bold text-lg">{t('Preferences')}</h3>

        <div className="mt-[30px] flex flex-col items-start space-y-6 text-on-surface">
          <div className="flex items-center w-full justify-between">
            <div className="flex items-center space-x-2">
              <h4 className="text-sm">{t('Subgraph Health Indicator')}</h4>
              <Question height={16} width={16} className="text-on-surface-subtlest ml-1 shrink-0" weight="fill" />
            </div>

            <ToggleSwitch
              className="ml-6"
              activated={activated}
              setActivated={(checked) => {
                setActivated(checked)
              }}
            />
          </div>

          <LanguageSettings
            onClickLanguage={() => {
              setOpen(false)
              setGlobalSettingsOpen?.(false)
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default GlobalSettings
