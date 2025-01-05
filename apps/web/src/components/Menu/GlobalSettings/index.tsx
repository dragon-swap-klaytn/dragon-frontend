import { Transition } from '@headlessui/react'
import { languageList, useTranslation } from '@pancakeswap/localization'
import { MenuIconButton, useModal } from '@pancakeswap/uikit'
import { CaretRight, Gear, Question } from '@phosphor-icons/react'
import clsx from 'clsx'
import ToggleSwitch from 'components/Common/ToggleSwitch'
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
  const [showLanguage, setShowLanguage] = useState(false)

  const [activated, setActivated] = useState(true)

  const { currentLanguage, setLanguage, t } = useTranslation()

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
          'absolute top-[50px] right-0 bg-surface-container-high p-6 rounded-2xl transition-opacity z-50 w-64 xxs:w-80 md:w-[340px]',
          {
            'opacity-100': setGlobalSettingsOpen ? globalSettingsOpen : open,
            'opacity-0 pointer-events-none': setGlobalSettingsOpen ? !globalSettingsOpen : !open,
          },
        )}
      >
        <h3 className="text-on-surface-primary font-bold text-lg">{t('Preferences')}</h3>

        <div className="mt-[30px] flex flex-col items-start space-y-6 text-on-surface-primary">
          <div className="flex items-center w-full justify-between">
            <div className="flex items-center space-x-2">
              <h4 className="text-sm">{t('Subgraph Health Indicator')}</h4>
              <Question height={16} width={16} className="text-on-surface-tertiary ml-1 shrink-0" weight="fill" />
            </div>

            <ToggleSwitch
              className="ml-6"
              activated={activated}
              setActivated={(checked) => {
                setActivated(checked)
              }}
            />
          </div>

          <div className="flex items-start justify-between w-full">
            <h4 className="text-sm">{t('Language')}</h4>

            <div className="flex flex-col items-end">
              <div className="flex items-center space-x-1">
                <button
                  type="button"
                  className="text-sm text-on-surface-tertiary"
                  onClick={() => {
                    setShowLanguage((prev) => !prev)
                  }}
                >
                  {currentLanguage.language}
                </button>

                <CaretRight
                  height={16}
                  width={16}
                  className={clsx('text-on-surface-tertiary', {
                    'transform rotate-90': showLanguage,
                  })}
                />
              </div>

              <Transition
                show={showLanguage}
                enter="transition-opacity duration-100"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="transition-opacity duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="flex items-center space-x-2 mt-6">
                  {languageList.map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => {
                        setLanguage(lang)
                        setShowLanguage(false)
                        setOpen(false)
                        setGlobalSettingsOpen?.(false)
                      }}
                      className={clsx('rounded-[20px] p-2 text-sm hover:opacity-70 px-4 h-10 whitespace-nowrap', {
                        'bg-surface-orange': lang.code === currentLanguage.code,
                        'bg-surface-disable': lang.code !== currentLanguage.code,
                      })}
                    >
                      {lang.language}
                    </button>
                  ))}
                </div>
              </Transition>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GlobalSettings
