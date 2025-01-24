import { useTranslation } from '@pancakeswap/localization'
import { WalletModalV2 } from '@pancakeswap/ui-wallets'

import { getDocLink } from 'config/wallet'
import useAuth from 'hooks/useAuth'
// @ts-ignore
// eslint-disable-next-line import/extensions
import { ButtonV2, useModal } from '@pancakeswap/uikit'
import clsx from 'clsx'
import useWallets from 'hooks/useWallets'
import { PropsWithChildren, useCallback, useEffect, useMemo, useState } from 'react'
import { logGTMWalletConnectEvent } from 'utils/customGTMEventTracking'
import { walletConnectNoQrCodeConnector } from 'utils/wagmi'
import Trans from './Trans'

const ConnectWalletButton = ({
  children,
  width = 'w-full',
  className,
  disabled,
}: PropsWithChildren<{ width?: string; className?: string; disabled?: boolean }>) => {
  const { login } = useAuth()
  const {
    t,
    currentLanguage: { code },
  } = useTranslation()
  const [open, setOpen] = useState(false)

  const docLink = useMemo(() => getDocLink(code), [code])
  const wallets = useWallets()

  const [onPresentConnectWalletModal, onDismissCallback] = useModal(
    <WalletModalV2
      docText={t('Learn How to Connect')}
      docLink={docLink}
      isOpen={open}
      wallets={wallets}
      login={login}
      onDismiss={() => setOpen(false)}
      onWalletConnectCallBack={logGTMWalletConnectEvent}
      walletConnectNoQrCodeConnector={walletConnectNoQrCodeConnector}
    />,
  )

  useEffect(() => {
    return () => {
      onDismissCallback()
    }
  }, [onDismissCallback])

  const handleClick = useCallback(() => {
    setOpen(true)
    onPresentConnectWalletModal()
  }, [onPresentConnectWalletModal])

  return (
    <>
      <ButtonV2 variant="primary" onClick={handleClick} className={clsx(width, className)} disabled={disabled}>
        {children || <Trans>Connect Wallet</Trans>}
      </ButtonV2>

      <style jsx global>{`
        w3m-modal {
          position: relative;
          z-index: 99;
        }
      `}</style>
    </>
  )
}

export default ConnectWalletButton
