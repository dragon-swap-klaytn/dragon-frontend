import { ChainId } from '@pancakeswap/chains'
import { Trans, useTranslation } from '@pancakeswap/localization'
import { ArrowForwardIcon, ButtonV2, Modal } from '@pancakeswap/uikit'
import { ChainLogo } from 'components/Logo/ChainLogo'
import useAuth from 'hooks/useAuth'
import { useSwitchNetwork } from 'hooks/useSwitchNetwork'
import { useNetwork } from 'wagmi'
import Dots from '../Loader/Dots'

// Where page network is not equal to wallet network
export function WrongNetworkModal({ onDismiss }: { onDismiss: () => void }) {
  const { switchNetworkAsync, isLoading, canSwitch } = useSwitchNetwork()
  const { chain } = useNetwork()
  const { logout } = useAuth()
  const { t } = useTranslation()

  const switchText = t('Switch to {{network}}', { network: 'Kaia' })

  return (
    <Modal title={t('Network Configuration Error')} onDismiss={onDismiss} hideCloseButton>
      <div className="w-full">
        <p className="text-sm text-on-surface">
          <Trans
            t={t}
            i18nKey="This page is designed for the <b>Kaia network</b> only."
            components={{
              b: <b />,
            }}
          />
        </p>
        <p className="text-sm text-on-surface">
          <Trans
            t={t}
            i18nKey="You are currently connected to <b>{{network}}</b>. Please switch networks to continue."
            values={{ network: chain?.name ?? '' }}
            components={{
              b: <b />,
            }}
          />
        </p>

        <div className="flex items-center space-x-2 p-3 rounded-xl bg-red-950 mt-4 text-sm text-on-surface">
          <ChainLogo chainId={chain?.id ?? 0} /> <ArrowForwardIcon color="#D67E0A" />
          <ChainLogo chainId={ChainId.KLAYTN} />
          <span>{t('Switch network to continue.')}</span>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-2">
          {canSwitch ? (
            <ButtonV2
              variant="primary"
              state={isLoading ? 'loading' : 'default'}
              onClick={() => switchNetworkAsync(ChainId.KLAYTN)}
              disabled={isLoading}
            >
              {isLoading ? <Dots>{switchText}</Dots> : switchText}
            </ButtonV2>
          ) : (
            <p className="text-sm text-red-400">{t('Unable to switch network. Please try it on your wallet')}</p>
          )}
          <ButtonV2 variant="subtle" onClick={logout}>
            {t('Disconnect Wallet')}
          </ButtonV2>
        </div>
      </div>
    </Modal>
  )
}
