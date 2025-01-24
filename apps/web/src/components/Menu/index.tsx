import { List } from '@phosphor-icons/react'
import clsx from 'clsx'
import { DragonSwapLogo, DragonSwapTextLogo } from 'components/Vector'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import GlobalSettings from './GlobalSettings'
import { SettingsMode } from './GlobalSettings/types'
import UserMenu from './UserMenu'

const MENU_ITEMS = [
  {
    title: 'Swap',
    href: '/swap',
  },
  {
    title: 'Pools',
    href: '/pools',
  },
  {
    title: 'Farms',
    href: '/farms',
  },
  {
    title: 'Dashboard',
    href: '/dashboard',
  },
]

const Menu = () => {
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [globalSettingsOpen, setGlobalSettingsOpen] = useState(false)

  useEffect(() => {
    if (!userMenuOpen) return

    setGlobalSettingsOpen(false)
  }, [userMenuOpen, setGlobalSettingsOpen])

  useEffect(() => {
    if (!globalSettingsOpen) return

    setUserMenuOpen(false)
  }, [globalSettingsOpen, setUserMenuOpen])

  const [showMobileMenu, setShowMobileMenu] = useState(false)

  return (
    <>
      <div className="fixed top-0 w-full z-50 left-0 bg-surface flex items-center px-3 py-5 xxs:p-5 md:p-8 justify-between">
        <div className="md:hidden flex items-center space-x-6">
          <Link href="/" className="hover:opacity-70">
            <DragonSwapLogo />
          </Link>

          <button type="button" onClick={() => setShowMobileMenu(!showMobileMenu)} className="hover:opacity-70">
            <List size={24} className="text-on-surface-subtle shrink-0" />
          </button>
        </div>

        <div className="hidden md:flex items-center space-x-8">
          <Link href="/" className="hover:opacity-70">
            <DragonSwapTextLogo />
          </Link>

          {MENU_ITEMS.map((item) => (
            <Link href={item.href} key={`menu:${item.title}`} className="text-on-surface">
              {item.title}
            </Link>
          ))}
        </div>

        <div className="flex items-center">
          <UserMenu userMenuOpen={userMenuOpen} setUserMenuOpen={setUserMenuOpen} />

          <GlobalSettings
            mode={SettingsMode.GLOBAL}
            globalSettingsOpen={globalSettingsOpen}
            setGlobalSettingsOpen={setGlobalSettingsOpen}
          />
        </div>
      </div>

      <div
        className={clsx(
          'fixed bottom-0 w-full z-50 py-10 px-8 transition-all duration-300 ease-[cubic-bezier(0.33, 1, 0.68, 1)] flex flex-col space-y-10 bg-surface-raised',
          {
            'translate-y-0': showMobileMenu,
            'translate-y-full': !showMobileMenu,
          },
        )}
      >
        {MENU_ITEMS.map((item) => (
          <Link href={item.href} key={`menu:${item.title}`} className="text-on-surface">
            {item.title}
          </Link>
        ))}
      </div>
    </>
  )
}

export default Menu
