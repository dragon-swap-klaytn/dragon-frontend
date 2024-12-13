import { useTranslation } from '@pancakeswap/localization'
import { WalletModalV2 } from '@pancakeswap/ui-wallets'

import { createWallets, getDocLink } from 'config/wallet'
import { useActiveChainId } from 'hooks/useActiveChainId'
import useAuth from 'hooks/useAuth'
// @ts-ignore
// eslint-disable-next-line import/extensions
import { useMatchBreakpoints } from '@pancakeswap/uikit'
import Button from 'components/Common/Button'
// import { useActiveHandle } from 'hooks/useEagerConnect.bmp.ts'
import clsx from 'clsx'
import { PropsWithChildren, useMemo, useState } from 'react'
import { logGTMWalletConnectEvent } from 'utils/customGTMEventTracking'
import { useConnect } from 'wagmi'
import Trans from './Trans'

const ConnectWalletButton = ({
  children,
  width = 'w-full',
  className,
  disabled,
}: PropsWithChildren<{ width?: string; className?: string; disabled?: boolean }>) => {
  const { isMobile } = useMatchBreakpoints()
  // const handleActive = useActiveHandle()
  const { login } = useAuth()
  const {
    t,
    currentLanguage: { code },
  } = useTranslation()
  const { connectAsync } = useConnect()
  const { chainId } = useActiveChainId()
  const [open, setOpen] = useState(false)

  const docLink = useMemo(() => getDocLink(code), [code])

  const handleClick = () => {
    // console.log('__handleClick__', typeof __NEZHA_BRIDGE__, window.ethereum)
    // if (typeof __NEZHA_BRIDGE__ !== 'undefined' && !window.ethereum) {
    //   handleActive()
    // } else {
    //   setOpen(true)
    // }
    setOpen(true)
  }

  const wallets = useMemo(
    () =>
      chainId
        ? isMobile
          ? createWallets(chainId, connectAsync).filter(({ id }) => id !== 'injected' && id !== 'kaiawallet')
          : createWallets(chainId, connectAsync)
        : [],
    [chainId, connectAsync, isMobile],
  )

  return (
    <>
      <Button variant="primary" onClick={handleClick} className={clsx(width, className)} disabled={disabled}>
        {children || <Trans>Connect Wallet</Trans>}
      </Button>
      <style jsx global>{`
        w3m-modal {
          position: relative;
          z-index: 99;
        }
      `}</style>
      <WalletModalV2
        docText={t('Learn How to Connect')}
        docLink={docLink}
        isOpen={open}
        wallets={wallets}
        login={login}
        onDismiss={() => setOpen(false)}
        onWalletConnectCallBack={logGTMWalletConnectEvent}
      />
    </>
  )
}

export default ConnectWalletButton
