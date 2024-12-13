import { useTranslation } from '@pancakeswap/localization'
import { footerLinks, useModal } from '@pancakeswap/uikit'
import { NextLinkFromReactRouter } from '@pancakeswap/widgets-internal'
import USCitizenConfirmModal from 'components/Modal/USCitizenConfirmModal'

import { List } from '@phosphor-icons/react'
import { DragonSwapLogo, DragonSwapTextLogo } from 'components/Vector'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { useCakePrice } from 'hooks/useCakePrice'
import useTheme from 'hooks/useTheme'
import { IdType } from 'hooks/useUserIsUsCitizenAcknowledgement'
import { useWebNotifications } from 'hooks/useWebNotifications'
import { useWindowSize } from 'hooks/useWindowSize'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useMemo, useState } from 'react'
import { useAccount } from 'wagmi'
import GlobalSettings from './GlobalSettings'
import { SettingsMode } from './GlobalSettings/types'
import UserMenu from './UserMenu'
import { useMenuItems } from './hooks/useMenuItems'
import { getActiveMenuItem, getActiveSubMenuItem } from './utils'

// const Notifications = lazy(() => import('views/Notifications'))

const LinkComponent = (linkProps) => {
  return <NextLinkFromReactRouter to={linkProps.href} {...linkProps} prefetch={false} />
}

const Menu = (props) => {
  const { enabled } = useWebNotifications()
  const { chainId } = useActiveChainId()
  const { isDark, setTheme } = useTheme()
  const cakePrice = useCakePrice()
  const { currentLanguage, setLanguage, t } = useTranslation()
  const { pathname } = useRouter()
  const { width } = useWindowSize()

  const [onUSCitizenModalPresent] = useModal(
    <USCitizenConfirmModal title={t('PancakeSwap Perpetuals')} id={IdType.PERPETUALS} />,
    false,
    false,
    'usCitizenConfirmModal',
  )

  const menuItems = useMenuItems(onUSCitizenModalPresent)

  const activeMenuItem = getActiveMenuItem({ menuConfig: menuItems, pathname })
  const activeSubMenuItem = getActiveSubMenuItem({ menuItem: activeMenuItem, pathname })

  const toggleTheme = useMemo(() => {
    return () => setTheme(isDark ? 'light' : 'dark')
  }, [setTheme, isDark])

  const getFooterLinks = useMemo(() => {
    return footerLinks(t)
  }, [t])

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

  const { isConnected, connector } = useAccount()
  useEffect(() => {
    console.log('connector', connector)
  }, [connector])

  return (
    <>
      <div className="fixed top-0 w-full z-[9999] left-0 bg-surface-background flex items-center px-8 py-5 justify-between">
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

          {['Swap', 'Pools', 'Dashboard', 'Point'].map((item) => (
            <Link href="/swap" key={item} className="text-white">
              {item}
            </Link>
          ))}
        </div>

        <div className="flex items-center space-x-3">
          {/* <LangSelector
            currentLang={currentLanguage.code}
            langs={languageList}
            setLang={setLanguage}
            buttonScale="xs"
            color="textSubtle"
          /> */}
          <UserMenu userMenuOpen={userMenuOpen} setUserMenuOpen={setUserMenuOpen} />
          <GlobalSettings
            mode={SettingsMode.GLOBAL}
            globalSettingsOpen={globalSettingsOpen}
            setGlobalSettingsOpen={setGlobalSettingsOpen}
          />
          {/* <NetworkSwitcher /> */}
        </div>
      </div>
      {/* <UikitMenu
        linkComponent={LinkComponent}
        rightSide={
          <>
            <GlobalSettings mode={SettingsMode.GLOBAL} />

            <NetworkSwitcher />
            <UserMenu />
          </>
        }
        chainId={chainId}
        isDark={isDark}
        toggleTheme={toggleTheme}
        currentLang={currentLanguage.code}
        langs={languageList}
        setLang={setLanguage}
        cakePriceUsd={cakePrice.eq(BIG_ZERO) ? undefined : cakePrice}
        links={menuItems}
        subLinks={activeMenuItem?.hideSubNav || activeSubMenuItem?.hideSubNav ? [] : activeMenuItem?.items}
        footerLinks={getFooterLinks}
        activeItem={activeMenuItem?.href}
        activeSubItem={activeSubMenuItem?.href}
        buyCakeLabel={t('Buy CAKE', { cake: CAKE_SYMBOL_VIEW })}
        buyCakeLink="/swap?outputCurrency=KAIA&chainId=8217"
        {...props}
      /> */}
    </>
  )
}

export default Menu
