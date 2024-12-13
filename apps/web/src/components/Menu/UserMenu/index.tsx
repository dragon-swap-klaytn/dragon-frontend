import { useTranslation } from '@pancakeswap/localization'
import { UserMenu as UIKitUserMenu, useModal, UserMenuVariant } from '@pancakeswap/uikit'
import ConnectWalletButton from 'components/ConnectWalletButton'
import { useActiveChainId } from 'hooks/useActiveChainId'
import useAuth from 'hooks/useAuth'
// import NextLink from 'next/link'
import { useDomainNameForAddress } from 'hooks/useDomain'
import { Dispatch, SetStateAction, useCallback, useEffect, useState } from 'react'
import { useProfile } from 'state/profile/hooks'
import { usePendingTransactions } from 'state/transactions/hooks'
import { useAccount } from 'wagmi'
// import useAirdropModalStatus from 'components/GlobalCheckClaimStatus/hooks/useAirdropModalStatus'
// import ProfileUserMenuItem from './ProfileUserMenuItem'
import { CaretDown } from '@phosphor-icons/react'
import clsx from 'clsx'
import { ConnectorId, getWalletIconByConnectorId } from 'config/wallet'
import { useWindowSize } from 'hooks/useWindowSize'
import WalletModal, { WalletView } from './WalletModal'
// import ClaimYourNFT from './ClaimYourNFT'

const UserMenuItems = ({ isOpen }: { isOpen: boolean }) => {
  const { t } = useTranslation()
  const { chainId, isWrongNetwork } = useActiveChainId()
  const { logout } = useAuth()
  const { address: account } = useAccount()
  const { hasPendingTransactions } = usePendingTransactions()
  const { isInitialized, isLoading, profile } = useProfile()

  const [onPresentWalletModal] = useModal(<WalletModal initialView={WalletView.WALLET_INFO} />)
  const [onPresentTransactionModal] = useModal(<WalletModal initialView={WalletView.TRANSACTIONS} />)
  const [onPresentWrongNetworkModal] = useModal(<WalletModal initialView={WalletView.WRONG_NETWORK} />)
  const hasProfile = isInitialized && !!profile

  const onClickWalletMenu = useCallback((): void => {
    if (isWrongNetwork) {
      onPresentWrongNetworkModal()
    } else {
      onPresentWalletModal()
    }
  }, [isWrongNetwork, onPresentWalletModal, onPresentWrongNetworkModal])

  // <WalletUserMenuItem isWrongNetwork={isWrongNetwork} onPresentWalletModal={onClickWalletMenu} />
  //     <UserMenuItem as="button" disabled={isWrongNetwork} onClick={onPresentTransactionModal}>
  //       {t('Recent Transactions')}
  //       {hasPendingTransactions && <RefreshIcon spin />}
  //     </UserMenuItem>
  //     <UserMenuDivider />
  //     <UserMenuItem as="button" onClick={logout}>
  //       <Flex alignItems="center" justifyContent="space-between" width="100%">
  //         {t('Disconnect')}
  //         <LogoutIcon />
  //       </Flex>
  //     </UserMenuItem>

  return (
    <div
      className={clsx('absolute top-10 right-0 bg-surface-container-high p-6 rounded-2xl transition-opacity z-50', {
        'opacity-100': isOpen,
        'opacity-0 pointer-events-none': !isOpen,
      })}
    >
      <h3 className="text-white font-bold text-lg">{t('Preferences')}</h3>

      <div className="mt-[30px] flex flex-col items-start space-y-6 text-white">
        <button type="button" className="text-sm whitespace-nowrap" onClick={onClickWalletMenu}>
          {t('Wallet')}
        </button>
        <button type="button" className="text-sm whitespace-nowrap" onClick={onPresentTransactionModal}>
          {t('Recent Transactions')}
        </button>
        <button type="button" className="text-sm whitespace-nowrap" onClick={logout}>
          {t('Disconnect')}
        </button>
      </div>
    </div>
  )
}

const UserMenu = ({
  userMenuOpen,
  setUserMenuOpen,
}: {
  userMenuOpen: boolean
  setUserMenuOpen: Dispatch<SetStateAction<boolean>>
}) => {
  const { t } = useTranslation()
  const { address: account } = useAccount()
  const { domainName, avatar } = useDomainNameForAddress(account)
  useEffect(() => {
    console.log('domainName', domainName)
  }, [domainName])
  useEffect(() => {
    console.log('avatar', avatar)
  }, [avatar])
  const { isWrongNetwork } = useActiveChainId()
  const { hasPendingTransactions, pendingNumber } = usePendingTransactions()
  const { profile } = useProfile()
  const avatarSrc = profile?.nft?.image?.thumbnail ?? avatar
  const [userMenuText, setUserMenuText] = useState<string>('')
  const [userMenuVariable, setUserMenuVariable] = useState<UserMenuVariant>('default')
  const { width } = useWindowSize()
  const accountEllipsis = account ? `${account.substring(0, 4)}...${account.substring(account.length - 4)}` : null
  const { isConnected, connector } = useAccount()
  useEffect(() => {
    console.log('connector', connector)
  }, [connector])

  const { logout } = useAuth()

  const [onPresentWalletModal] = useModal(<WalletModal initialView={WalletView.WALLET_INFO} />)
  const [onPresentTransactionModal] = useModal(<WalletModal initialView={WalletView.TRANSACTIONS} />)
  const [onPresentWrongNetworkModal] = useModal(<WalletModal initialView={WalletView.WRONG_NETWORK} />)

  const onClickWalletMenu = useCallback((): void => {
    if (isWrongNetwork) {
      onPresentWrongNetworkModal()
    } else {
      onPresentWalletModal()
    }
  }, [isWrongNetwork, onPresentWalletModal, onPresentWrongNetworkModal])

  const ellipsis = !domainName

  useEffect(() => {
    if (hasPendingTransactions) {
      setUserMenuText(t('%num% Pending', { num: pendingNumber }))
      setUserMenuVariable('pending')
    } else {
      setUserMenuText('')
      setUserMenuVariable('default')
    }
  }, [hasPendingTransactions, pendingNumber, t])

  if (account) {
    return (
      <div className="relative">
        <button
          type="button"
          className="flex items-center space-x-2 hover:opacity-70"
          onClick={() => {
            console.log('__clicked')
            setUserMenuOpen((prev) => !prev)
          }}
        >
          {/* {icon ?? <MenuIcon className={avatarClassName} avatarSrc={avatarSrc} variant={variant} />} */}
          {/* <LabelText title={typeof text === "string" ? text || account : account}> */}
          {/* <span className="text-sm">{ellipsis ? accountEllipsis : account}</span> */}
          {connector && (
            <div className="w-6 h-6 shrink-0 rounded-full overflow-hidden">
              <img
                src={getWalletIconByConnectorId(connector.id as ConnectorId)}
                alt="avatar"
                className="w-full h-full object-cover object-center"
              />
            </div>
          )}

          <span className="text-sm">{ellipsis ? accountEllipsis : account}</span>
          <CaretDown size={16} className="inline-block" />
        </button>

        <div
          className={clsx('absolute top-10 right-0 bg-surface-container-high p-6 rounded-2xl transition-opacity z-50', {
            'opacity-100': userMenuOpen,
            'opacity-0 pointer-events-none': !userMenuOpen,
          })}
        >
          <h3 className="text-white font-bold text-lg">{t('Preferences')}</h3>

          <div className="mt-[30px] flex flex-col items-start space-y-6 text-white">
            <button type="button" className="text-sm whitespace-nowrap" onClick={onClickWalletMenu}>
              {t('Wallet')}
            </button>
            <button type="button" className="text-sm whitespace-nowrap" onClick={onPresentTransactionModal}>
              {t('Recent Transactions')}
            </button>
            <button type="button" className="text-sm whitespace-nowrap" onClick={logout}>
              {t('Disconnect')}
            </button>
          </div>
        </div>
      </div>

      // <UIKitUserMenu
      //   account={domainName || account}
      //   ellipsis={!domainName}
      //   // avatarSrc={avatarSrc}
      //   text={userMenuText}
      //   variant={userMenuVariable}
      // >
      //   {/* {({ isOpen }) => (isOpen ? <UserMenuItems /> : <></>)} */}
      //   {({ isOpen }) => <UserMenuItems isOpen={isOpen} />}
      // </UIKitUserMenu>
    )
  }

  if (isWrongNetwork) {
    return (
      <UIKitUserMenu text={t('Network')} variant="danger">
        {/* {({ isOpen }) => (isOpen ? <UserMenuItems /> : <></>)} */}
        {({ isOpen }) => <UserMenuItems isOpen={isOpen} />}
      </UIKitUserMenu>
    )
  }

  return (
    <ConnectWalletButton>
      <span className="text-sm">{width < 768 ? t('Connect') : t('Connect Wallet')}</span>
    </ConnectWalletButton>
  )
}

export default UserMenu
