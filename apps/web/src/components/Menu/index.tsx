import { List } from '@phosphor-icons/react'
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
    href: '/farms',
  },
  {
    title: 'Dashboard',
    href: '/dashboard',
  },
  {
    title: 'Point',
    href: '/point',
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

  return (
    <>
      <div className="fixed top-0 w-full z-50 left-0 bg-surface-background flex items-center px-4 md:px-8 py-5 justify-between">
        <div className="md:hidden flex items-center space-x-4">
          <Link href="/" className="hover:opacity-70">
            <DragonSwapLogo />
          </Link>

          <List height={24} width={24} className="text-on-surface-secondary" />
        </div>

        <div className="hidden md:flex items-center space-x-10">
          <Link href="/" className="hover:opacity-70">
            <DragonSwapTextLogo />
          </Link>

          {MENU_ITEMS.map((item) => (
            <Link href={item.href} key={`menu:${item.title}`} className="text-on-surface-primary">
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
    </>
  )
}

export default Menu
