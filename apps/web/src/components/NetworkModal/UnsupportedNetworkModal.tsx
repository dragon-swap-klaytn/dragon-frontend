import { DEFAULT_CHAIN_ID } from '@pancakeswap/chains'
import { useTranslation } from '@pancakeswap/localization'
import { ButtonV2, Modal } from '@pancakeswap/uikit'
import { useMenuItems } from 'components/Menu/hooks/useMenuItems'
import { getActiveMenuItem, getActiveSubMenuItem } from 'components/Menu/utils'
import { useLocalNetworkChain } from 'hooks/useActiveChainId'
import useAuth from 'hooks/useAuth'
import { useSwitchNetwork, useSwitchNetworkLocal } from 'hooks/useSwitchNetwork'
import { useRouter } from 'next/router'
import { useMemo } from 'react'
import { useAccount, useNetwork } from 'wagmi'
import Dots from '../Loader/Dots'

// Where chain is not supported or page not supported
export function UnsupportedNetworkModal({ pageSupportedChains }: { pageSupportedChains: number[] }) {
  const { switchNetworkAsync, isLoading, canSwitch } = useSwitchNetwork()
  const switchNetworkLocal = useSwitchNetworkLocal()
  const { chains } = useNetwork()
  const chainId = useLocalNetworkChain() || DEFAULT_CHAIN_ID
  const { isConnected } = useAccount()
  const { logout } = useAuth()
  const { t } = useTranslation()
  const menuItems = useMenuItems()
  const { pathname } = useRouter()

  const title = useMemo(() => {
    const activeMenuItem = getActiveMenuItem({ menuConfig: menuItems, pathname })
    const activeSubMenuItem = getActiveSubMenuItem({ menuItem: activeMenuItem, pathname })

    return activeSubMenuItem?.label || activeMenuItem?.label
  }, [menuItems, pathname])

  const supportedMainnetChains = useMemo(
    () => chains.filter((chain) => !chain.testnet && pageSupportedChains?.includes(chain.id)),
    [chains, pageSupportedChains],
  )

  return (
    <Modal title={t('Check your network')} hideCloseButton>
      <div className="w-full">
        <p className="break-keep text-center">
          {t('Currently %feature% only supported in', { feature: typeof title === 'string' ? title : 'this page' })}{' '}
          {/* {supportedMainnetChains?.map((c) => c.name).join(', ')} */}
          Kaia Network
        </p>
        <p className="mt-2 text-center break-keep">{t('Please switch your network to continue.')}</p>

        {canSwitch ? (
          <ButtonV2
            className="mt-6"
            variant="primary"
            state={isLoading ? 'loading' : 'default'}
            onClick={() => {
              if (supportedMainnetChains.map((c) => c.id).includes(chainId)) {
                switchNetworkAsync(chainId)
              } else {
                switchNetworkAsync(DEFAULT_CHAIN_ID)
              }
            }}
            fullWidth
          >
            {isLoading ? <Dots>{t('Switch network in wallet')}</Dots> : t('Switch network in wallet')}
          </ButtonV2>
        ) : (
          <ButtonV2 className="mt-6" variant="primary" disabled onClick={() => {}} fullWidth>
            {t('Unable to switch network. Please try it on your wallet')}
          </ButtonV2>
        )}

        {isConnected && (
          <ButtonV2
            variant="subtle"
            fullWidth
            className="mt-3"
            onClick={() =>
              logout().then(() => {
                switchNetworkLocal(DEFAULT_CHAIN_ID)
              })
            }
          >
            {t('Disconnect Wallet')}
          </ButtonV2>
        )}
      </div>
    </Modal>
  )
}
