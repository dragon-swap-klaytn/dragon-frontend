import { useTranslation } from '@pancakeswap/localization'
import { WNATIVE } from '@pancakeswap/sdk'
import { ButtonV2, CopyButton, ExternalLink, InjectedModalProps, Skeleton } from '@pancakeswap/uikit'
import { FetchStatus } from 'config/constants/types'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import useAuth from 'hooks/useAuth'
import useNativeCurrency from 'hooks/useNativeCurrency'
import useTokenBalance from 'hooks/useTokenBalance'

import { formatBigInt, getFullDisplayBalance } from '@pancakeswap/utils/formatBalance'

import { useCallback } from 'react'
import { getBlockExploreLink } from 'utils'
import { Address, useBalance } from 'wagmi'

interface WalletInfoProps {
  switchView: (newIndex: number) => void
  onDismiss: InjectedModalProps['onDismiss']
}

const WalletInfo: React.FC<WalletInfoProps> = ({ onDismiss }) => {
  const { t } = useTranslation()
  const { account, chainId } = useActiveWeb3React()
  const nativeBalance = useBalance({ address: account as Address, enabled: true })
  const native = useNativeCurrency()
  const wNativeToken = WNATIVE[chainId]
  const { balance: wNativeBalance, fetchStatus: wNativeFetchStatus } = useTokenBalance(wNativeToken?.address)
  const { logout } = useAuth()

  const handleLogout = useCallback(() => {
    onDismiss?.()
    logout()
  }, [logout, onDismiss])

  return (
    <>
      {/* <p className="mt-4">{account && <CopyAddress tooltipMessage={t('Copied')} address={account} />}</p> */}
      {account && (
        <div className="px-4 py-3 rounded-[20px] bg-neutral mt-4 justify-between relative">
          <span className="text-sm text-on-surface overflow-x-auto pr-2">{account}</span>

          <CopyButton
            className="text-on-surface shrink-0 absolute right-0 top-1/2 -translate-y-1/2 pl-2 pr-3 h-5"
            text={account}
            tooltipMessage={t('Copied')}
          />
        </div>
      )}

      <div className="mt-4 flex flex-col space-y-2">
        {account && (
          <div className="flex w-full justify-end">
            <ExternalLink href={getBlockExploreLink(account, 'address', chainId)} className="text-sm text-on-surface">
              KaiaScope
            </ExternalLink>
          </div>
        )}

        <div className="flex items-center space-x-2 justify-between text-on-surface text-sm">
          <h4>
            {native.symbol} {t('Balance')}
          </h4>

          {!nativeBalance.isFetched ? (
            <Skeleton height="22px" width="60px" />
          ) : (
            <span>{formatBigInt(nativeBalance?.data?.value ?? 0n, 6)}</span>
          )}
        </div>

        {wNativeBalance && wNativeBalance.gt(0) && (
          <div className="flex items-center space-x-2 justify-between text-on-surface text-sm">
            <h4>
              {wNativeToken.symbol} {t('Balance')}
            </h4>

            {wNativeFetchStatus !== FetchStatus.Fetched ? (
              <Skeleton height="22px" width="60px" />
            ) : (
              wNativeToken?.decimals && <span>{getFullDisplayBalance(wNativeBalance, wNativeToken?.decimals, 6)}</span>
            )}
          </div>
        )}
      </div>

      <ButtonV2 variant="primary" fullWidth onClick={handleLogout} className="mt-6">
        {t('Disconnect Wallet')}
      </ButtonV2>
    </>
  )
}

export default WalletInfo
