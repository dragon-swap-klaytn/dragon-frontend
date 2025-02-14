import { List } from '@phosphor-icons/react'
import { MobileSideBar } from 'components/Menu/MobileSideBar'
import { DragonSwapLogo, DragonSwapTextLogo } from 'components/Vector'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import GlobalSettings from './GlobalSettings'
import { SettingsMode } from './GlobalSettings/types'
import UserMenu from './UserMenu'

export const MENU_ITEMS = [
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
      <div className="fixed top-0 w-full z-header left-0 bg-surface flex items-center pl-5 pr-3 py-5 xs:pl-7 xs:pr-5 xs:py-5 md:p-8 justify-between">
        <div className="md:hidden flex items-center space-x-4">
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

        <div className="flex items-center space-x-2">
          <UserMenu userMenuOpen={userMenuOpen} setUserMenuOpen={setUserMenuOpen} />

          <GlobalSettings
            mode={SettingsMode.GLOBAL}
            globalSettingsOpen={globalSettingsOpen}
            setGlobalSettingsOpen={setGlobalSettingsOpen}
          />
        </div>
      </div>

      <MobileSideBar isOpen={showMobileMenu} onDismiss={() => setShowMobileMenu(false)} />
    </>
  )
}

export default Menu
