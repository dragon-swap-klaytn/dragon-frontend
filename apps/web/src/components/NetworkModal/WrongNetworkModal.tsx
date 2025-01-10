import { DEFAULT_CHAIN_ID } from '@pancakeswap/chains'
import { useTranslation } from '@pancakeswap/localization'
import { ArrowForwardIcon, ButtonV2, Modal } from '@pancakeswap/uikit'
import { ChainLogo } from 'components/Logo/ChainLogo'
import useAuth from 'hooks/useAuth'
import { useSessionChainId } from 'hooks/useSessionChainId'
import { useSwitchNetwork } from 'hooks/useSwitchNetwork'
import { Chain, useAccount, useNetwork } from 'wagmi'
import Dots from '../Loader/Dots'

// Where page network is not equal to wallet network
export function WrongNetworkModal({ currentChain, onDismiss }: { currentChain: Chain; onDismiss: () => void }) {
  const { switchNetworkAsync, isLoading, canSwitch } = useSwitchNetwork()
  const { chain } = useNetwork()
  const { logout } = useAuth()
  const { isConnected } = useAccount()
  const [, setSessionChainId] = useSessionChainId()
  const chainId = currentChain.id || DEFAULT_CHAIN_ID
  const { t } = useTranslation()

  const switchText = t('Switch to %network%', { network: currentChain.name })

  return (
    <Modal title={t('You are in wrong network')} onDismiss={onDismiss}>
      <div className="w-full">
        {/* <p>{t('This page is located for %network%.', { network: currentChain.name })}</p> */}
        <p className="text-sm text-on-surface">{t('This page is located for %network%.', { network: 'Kaia' })}</p>
        <p className="text-sm text-on-surface">
          {t('You are under %network% now, please switch the network to continue.', { network: chain?.name ?? '' })}
        </p>

        <div className="flex items-center space-x-2 p-3 rounded-xl bg-red-950 mt-4 text-sm text-on-surface">
          <ChainLogo chainId={chain?.id ?? 0} /> <ArrowForwardIcon color="#D67E0A" />
          <ChainLogo chainId={chainId} />
          <span>{t('Switch network to continue.')}</span>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-2">
          {canSwitch ? (
            <ButtonV2
              variant="primary"
              state={isLoading ? 'loading' : 'default'}
              onClick={() => switchNetworkAsync(chainId)}
            >
              {isLoading ? <Dots>{switchText}</Dots> : switchText}
            </ButtonV2>
          ) : (
            <p className="text-sm text-red-400">{t('Unable to switch network. Please try it on your wallet')}</p>
          )}
          {isConnected && (
            <ButtonV2
              variant="subtle"
              onClick={() =>
                logout().then(() => {
                  setSessionChainId(chainId)
                })
              }
            >
              {t('Disconnect Wallet')}
            </ButtonV2>
          )}
        </div>
      </div>
    </Modal>
  )
}
