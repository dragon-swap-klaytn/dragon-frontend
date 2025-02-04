import { memo, useEffect, useState } from 'react'

import { InjectedModalProps, ModalV3, WindowSize } from '@pancakeswap/uikit'

import { MENU_ITEMS } from 'components/Menu'
import { ExternalLinks } from 'components/Menu/Footer'
import LanguageSettings from 'components/Menu/GlobalSettings/LanguageSettings'
import { useWindowSize } from 'hooks/useWindowSize'
import Link from 'next/link'

type MobileSideBarProps = {
  isOpen: boolean
}
export const MobileSideBar = memo<InjectedModalProps & MobileSideBarProps>(function MobileSideBarComp({
  isOpen,
  onDismiss,
}) {
  const [, setGlobalSettingsOpen] = useState(false)
  const { width } = useWindowSize()
  useEffect(() => {
    if (width < WindowSize.mobile) return

    onDismiss?.()
  }, [onDismiss, width])

  return (
    <ModalV3 closeOnOverlayClick isOpen={isOpen} onDismiss={onDismiss} hideCloseButton>
      <div className="flex flex-col space-y-10 px-2">
        {MENU_ITEMS.map((item) => (
          <Link
            href={item.href}
            key={`menu:${item.title}`}
            className="text-on-surface"
            onClick={() => {
              onDismiss?.()
            }}
          >
            {item.title}
          </Link>
        ))}
      </div>

      <LanguageSettings className="mt-32" onClickLanguage={() => setGlobalSettingsOpen?.(false)} />

      <ExternalLinks className="mt-8" />
    </ModalV3>
  )
})
