import { languageList, Trans, useTranslation } from '@pancakeswap/localization'
import { CAKE_SYMBOL_VIEW } from '@pancakeswap/tokens'
import { LangSelector, Menu as UikitMenu, footerLinks, useModal } from '@pancakeswap/uikit'
import { BIG_ZERO } from '@pancakeswap/utils/bigNumber'
import { NextLinkFromReactRouter } from '@pancakeswap/widgets-internal'
import USCitizenConfirmModal from 'components/Modal/USCitizenConfirmModal'
import { NetworkSwitcher } from 'components/NetworkSwitcher'

import { useActiveChainId } from 'hooks/useActiveChainId'
import { useCakePrice } from 'hooks/useCakePrice'
import useTheme from 'hooks/useTheme'
import { IdType } from 'hooks/useUserIsUsCitizenAcknowledgement'
import { useWebNotifications } from 'hooks/useWebNotifications'
import { useRouter } from 'next/router'
import { useEffect, useMemo } from 'react'
import { DragonSwapLogo, DragonSwapTextLogo } from 'components/Vector'
import Link from 'next/link'
import { useWindowSize } from 'hooks/useWindowSize'
import { Hamburger, List } from '@phosphor-icons/react'
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

  return (
    <>
      <div className="fixed top-0 w-full z-[9999] left-0 bg-surface-background flex items-center px-8 py-5 justify-between">
        <div className="md:hidden flex items-center space-x-4">
          <DragonSwapLogo />

          <List height={24} width={24} className="text-on-surface-secondary" />
        </div>

        <div className="hidden md:flex items-center space-x-10">
          <DragonSwapTextLogo />

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
          <UserMenu>
            <span className="text-sm">
              <Trans>{width < 768 ? 'Connect' : 'Connect Wallet'}</Trans>
            </span>
          </UserMenu>

          <GlobalSettings mode={SettingsMode.GLOBAL} />
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
