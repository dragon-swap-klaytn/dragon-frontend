import { WalletModalV2 } from '@pancakeswap/ui-wallets'

import useAuth from 'hooks/useAuth'
// @ts-ignore
// eslint-disable-next-line import/extensions
import { ButtonV2, ButtonV2Scale, useModal } from '@pancakeswap/uikit'
import useWallets from 'hooks/useWallets'
import { PropsWithChildren } from 'react'
import { logGTMWalletConnectEvent } from 'utils/customGTMEventTracking'
import { walletConnectNoQrCodeConnector } from 'utils/wagmi'
import Trans from './Trans'

const ConnectWalletButton = ({
  children,
  fullWidth = true,
  className,
  disabled,
  scale = 'md',
}: PropsWithChildren<{ fullWidth?: boolean; className?: string; disabled?: boolean; scale?: ButtonV2Scale }>) => {
  const { login } = useAuth()
  const wallets = useWallets()

  const [onPresentConnectWalletModal] = useModal(
    <WalletModalV2
      wallets={wallets}
      login={login}
      onWalletConnectCallBack={logGTMWalletConnectEvent}
      walletConnectNoQrCodeConnector={walletConnectNoQrCodeConnector}
    />,
  )

  return (
    <>
      <ButtonV2
        variant="primary"
        onClick={onPresentConnectWalletModal}
        className={className}
        disabled={disabled}
        fullWidth={fullWidth}
        scale={scale}
      >
        {children || <Trans>Connect Wallet</Trans>}
      </ButtonV2>

      <style jsx global>{`
        wcm-modal {
          position: relative;
          z-index: 9999;
        }
      `}</style>
    </>
  )
}

export default ConnectWalletButton
