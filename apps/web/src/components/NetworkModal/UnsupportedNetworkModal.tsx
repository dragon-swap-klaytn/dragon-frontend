import { DEFAULT_CHAIN_ID } from '@pancakeswap/chains'
import { useTranslation } from '@pancakeswap/localization'
import { ButtonV2, Modal } from '@pancakeswap/uikit'
import { useLocalNetworkChain } from 'hooks/useActiveChainId'
import useAuth from 'hooks/useAuth'
import { useSwitchNetwork } from 'hooks/useSwitchNetwork'
import { useMemo } from 'react'
import { useNetwork } from 'wagmi'
import Dots from '../Loader/Dots'

// Where chain is not supported or page not supported
export function UnsupportedNetworkModal({ pageSupportedChains }: { pageSupportedChains: number[] }) {
  const { switchNetworkAsync, isLoading, canSwitch } = useSwitchNetwork()
  const { chains } = useNetwork()
  const chainId = useLocalNetworkChain() || DEFAULT_CHAIN_ID
  const { logout } = useAuth()
  const { t } = useTranslation()

  const supportedMainnetChains = useMemo(
    () => chains.filter((chain) => !chain.testnet && pageSupportedChains?.includes(chain.id)),
    [chains, pageSupportedChains],
  )

  return (
    <Modal title={t('Check your network')} hideCloseButton>
      <div className="w-full">
        <p className="break-keep text-center text-on-surface">
          {/* {t('Currently {{feature}} only supported in', { feature: typeof title === 'string' ? title : 'this page' })}{' '} */}
          {t('Currently {{feature}} only supported in', { feature: 'this page' })}{' '}
          {/* {supportedMainnetChains?.map((c) => c.name).join(', ')} */}
          Kaia Network
        </p>
        <p className="mt-2 text-center break-keep text-on-surface">{t('Please switch your network to continue.')}</p>

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

        <ButtonV2 variant="subtle" fullWidth className="mt-3" onClick={logout}>
          {t('Disconnect Wallet')}
        </ButtonV2>
      </div>
    </Modal>
  )
}
