import { useTranslation } from '@pancakeswap/localization'
import { MenuIconButton, useModal } from '@pancakeswap/uikit'
import { Gear } from '@phosphor-icons/react'
import clsx from 'clsx'
import LocaleSettings from 'components/Menu/GlobalSettings/LocaleSettings'
import { SettingModeType, SettingsMode } from 'components/Menu/GlobalSettings/types'
import { usePathname } from 'next/navigation'
import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react'
import SettingsModal from './SettingsModal'

type Props = {
  mode?: SettingModeType
  globalSettingsOpen?: boolean
  setGlobalSettingsOpen?: Dispatch<SetStateAction<boolean>>
}

const GlobalSettings = ({ mode, globalSettingsOpen, setGlobalSettingsOpen }: Props) => {
  const [onPresentSettingsModal] = useModal(<SettingsModal mode={mode} />)
  const [open, setOpen] = useState(false)
  const { t } = useTranslation()

  const pathname = usePathname()
  const pathnameRef = useRef(pathname)
  useEffect(() => {
    if (!pathnameRef.current) return
    if (pathnameRef.current !== pathname) {
      setGlobalSettingsOpen?.(false)
    }

    pathnameRef.current = pathname
  }, [pathname, setGlobalSettingsOpen])

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
          'absolute top-[50px] right-0 bg-surface-overlay p-6 rounded-2xl transition-opacity z-50 w-64 xs:w-80 md:w-[340px]',
          {
            'opacity-100': setGlobalSettingsOpen ? globalSettingsOpen : open,
            'opacity-0 pointer-events-none': setGlobalSettingsOpen ? !globalSettingsOpen : !open,
          },
        )}
      >
        <h3 className="text-on-surface font-bold text-lg">{t('Preferences')}</h3>

        <div className="mt-[30px] flex flex-col items-start space-y-6 text-on-surface">
          <LocaleSettings
            onClickLocale={() => {
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
