import { useTranslation } from '@pancakeswap/localization'
import { WNATIVE } from '@pancakeswap/sdk'
import { CopyButton, InjectedModalProps, Skeleton } from '@pancakeswap/uikit'
import { FetchStatus } from 'config/constants/types'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import useAuth from 'hooks/useAuth'
import useNativeCurrency from 'hooks/useNativeCurrency'
import useTokenBalance from 'hooks/useTokenBalance'

import { formatBigInt, getFullDisplayBalance } from '@pancakeswap/utils/formatBalance'

import Button from 'components/Common/Button'
import ExternalLink from 'components/Common/ExternalLink'
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

  const handleLogout = () => {
    onDismiss?.()
    logout()
  }

  return (
    <>
      {/* <p className="mt-4">{account && <CopyAddress tooltipMessage={t('Copied')} address={account} />}</p> */}
      {account && (
        <div className="px-4 py-3 rounded-[20px] bg-surface-container-highest mt-4 justify-between relative">
          <span className="text-sm text-on-surface-primary overflow-x-auto pr-2">{account}</span>

          <div className="absolute right-0 top-1/2 -translate-y-1/2 bg-surface-container-highest pl-2 pr-3 h-5">
            <CopyButton
              className="text-on-surface-primary shrink-0"
              width="20px"
              text={account}
              tooltipMessage={t('Copied')}
            />
          </div>
        </div>
      )}

      <div className="mt-4 flex flex-col space-y-2">
        {account && (
          <div className="flex w-full justify-end">
            <ExternalLink
              href={getBlockExploreLink(account, 'address', chainId)}
              className="text-sm text-on-surface-primary"
            >
              KaiaScope
            </ExternalLink>
          </div>
        )}

        <div className="flex items-center space-x-2 justify-between text-on-surface-primary text-sm">
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
          <div className="flex items-center space-x-2 justify-between text-on-surface-primary text-sm">
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

      <Button variant="primary" fullWidth onClick={handleLogout} className="mt-6">
        {t('Disconnect Wallet')}
      </Button>
    </>
  )
}

export default WalletInfo
