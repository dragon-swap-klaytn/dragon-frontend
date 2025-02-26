import { DEFAULT_CHAIN_ID, DEFAULT_TESTNET_ID } from '@pancakeswap/chains'
import { FarmWithStakedValue } from '@pancakeswap/farms'
import { useTranslation } from '@pancakeswap/localization'
import { NATIVE, WNATIVE } from '@pancakeswap/sdk'
import { CAKE_SYMBOL_VIEW } from '@pancakeswap/tokens'
import { useModal, useToast } from '@pancakeswap/uikit'
import { FarmWidget } from '@pancakeswap/widgets-internal'
import ConnectWalletButton from 'components/ConnectWalletButton'
import WalletModal from 'components/Menu/UserMenu/WalletModal'
import { ToastDescriptionWithTx } from 'components/Toast'
import useAccountActiveChain from 'hooks/useAccountActiveChain'
import { useCakePrice } from 'hooks/useCakePrice'
import useCatchTxError from 'hooks/useCatchTxError'
import { useERC20 } from 'hooks/useContract'
import useNativeCurrency from 'hooks/useNativeCurrency'
import { useRouter } from 'next/router'
import { useCallback, useContext, useMemo } from 'react'
import { useAppDispatch } from 'state'
import { fetchFarmUserDataAsync } from 'state/farms'
import { pickFarmTransactionTx } from 'state/global/actions'
import { useNonBscFarmPendingTransaction } from 'state/transactions/hooks'
import getLiquidityUrlPathParts from 'utils/getLiquidityUrlPathParts'
import { Hash } from 'viem'
import { useAccount } from 'wagmi'
import useApproveFarm from '../../../hooks/useApproveFarm'
import { useFirstTimeCrossFarming } from '../../../hooks/useFirstTimeCrossFarming'
import useStakeFarms from '../../../hooks/useStakeFarms'
import useUnstakeFarms from '../../../hooks/useUnstakeFarms'
import { YieldBoosterStateContext } from '../../YieldBooster/components/ProxyFarmContainer'
import useProxyStakedActions from '../../YieldBooster/hooks/useProxyStakedActions'
import { YieldBoosterState } from '../../YieldBooster/hooks/useYieldBoosterState'

interface StackedActionProps extends FarmWithStakedValue {
  userDataReady: boolean
  lpLabel?: string
  displayApr?: string
  onStake?: (value: string) => Promise<Hash>
  onUnstake?: (value: string) => Promise<Hash>
  onDone?: () => void
  onApprove?: () => Promise<Hash>
  isApproved?: boolean
  shouldUseProxyFarm?: boolean
}

export function useStakedActions(lpContract, pid) {
  const { account, chainId } = useAccountActiveChain()
  const { onStake } = useStakeFarms(pid)
  const { onUnstake } = useUnstakeFarms(pid)
  const dispatch = useAppDispatch()

  const { onApprove } = useApproveFarm(lpContract, chainId)

  const onDone = useCallback(() => {
    if (!account) return

    dispatch(fetchFarmUserDataAsync({ account, pids: [pid], chainId }))
  }, [account, pid, chainId, dispatch])

  return {
    onStake,
    onUnstake,
    onApprove,
    onDone,
  }
}

export const ProxyStakedContainer = ({ children, ...props }) => {
  const { address: account } = useAccount()

  const { lpAddress } = props
  const lpContract = useERC20(lpAddress)

  const { onStake, onUnstake, onApprove, onDone } = useProxyStakedActions(props.pid, lpContract)

  const { allowance } = props.userData || {}

  const isApproved = account && allowance && allowance.isGreaterThan(0)

  return children({
    ...props,
    onStake,
    onDone,
    onUnstake,
    onApprove,
    isApproved,
  })
}

export const StakedContainer = ({ children, ...props }) => {
  const { address: account } = useAccount()

  const { lpAddress } = props
  const lpContract = useERC20(lpAddress)
  const { onStake, onUnstake, onApprove, onDone } = useStakedActions(lpContract, props.pid)

  const { allowance } = props.userData || {}

  const isApproved = account && allowance && allowance.isGreaterThan(0)

  return children({
    ...props,
    onStake,
    onDone,
    onUnstake,
    onApprove,
    isApproved,
  })
}

const Staked: React.FunctionComponent<React.PropsWithChildren<StackedActionProps>> = ({
  pid,
  apr,
  vaultPid,
  multiplier,
  lpSymbol,
  lpLabel,
  lpAddress,
  lpTokenPrice,
  quoteToken,
  token,
  userDataReady,
  displayApr,
  lpTotalSupply,
  tokenAmountTotal,
  quoteTokenAmountTotal,
  userData,
  lpRewardsApr,
  onDone,
  onStake,
  onUnstake,
  onApprove,
  isApproved,
}) => {
  const dispatch = useAppDispatch()
  const native = useNativeCurrency()
  const pendingFarm = useNonBscFarmPendingTransaction(lpAddress)
  const { boosterState } = useContext(YieldBoosterStateContext)
  const { isFirstTime } = useFirstTimeCrossFarming(vaultPid)
  const { t } = useTranslation()
  const { toastSuccess } = useToast()
  const { fetchWithCatchTxError, loading: pendingTx } = useCatchTxError()
  const { account, chainId } = useAccountActiveChain()

  const { tokenBalance, stakedBalance, allowance } = userData || {}

  const router = useRouter()
  const cakePrice = useCakePrice()

  const liquidityUrlPathParts = getLiquidityUrlPathParts({
    quoteTokenAddress: quoteToken.address,
    tokenAddress: token.address,
    chainId,
  })
  const addLiquidityUrl = `/v2/add/${liquidityUrlPathParts}`

  const isStakeReady = useMemo(() => {
    return ['history', 'archived'].some((item) => router.pathname.includes(item)) || pendingFarm.length > 0
  }, [pendingFarm, router])

  const crossChainWarningText = useMemo(() => {
    return isFirstTime
      ? t('A small amount of {{nativeToken}} is required for the first-time setup of cross-chain {{cake}} farming.', {
          nativeToken: native.symbol,
          cake: CAKE_SYMBOL_VIEW,
        })
      : t('For safety, cross-chain transactions will take around 30 minutes to confirm.')
  }, [isFirstTime, native, t])

  const handleStake = useCallback(
    async (amount: string) => {
      const receipt = await fetchWithCatchTxError(() => {
        if (onStake) {
          return onStake(amount)
        }

        return new Promise<null>((resolve) => resolve(null))
      })

      if (receipt?.status) {
        toastSuccess(
          `${t('Staked')}!`,
          <ToastDescriptionWithTx txHash={receipt.transactionHash}>
            {t('Your funds have been staked in the farm')}
          </ToastDescriptionWithTx>,
        )

        onDone?.()
      }
    },
    [fetchWithCatchTxError, onStake, t, toastSuccess, onDone],
  )

  const handleUnstake = useCallback(
    async (amount: string) => {
      const receipt = await fetchWithCatchTxError(() => {
        if (onUnstake) {
          return onUnstake(amount)
        }

        return new Promise<null>((resolve) => resolve(null))
      })
      if (receipt?.status) {
        toastSuccess(
          `${t('Unstaked')}!`,
          <ToastDescriptionWithTx txHash={receipt.transactionHash}>
            {t('Your earnings have also been harvested to your wallet')}
          </ToastDescriptionWithTx>,
        )

        onDone?.()
      }
    },
    [fetchWithCatchTxError, onUnstake, t, toastSuccess, onDone],
  )

  const handleApprove = useCallback(async () => {
    const receipt = await fetchWithCatchTxError(() => {
      if (onApprove) {
        return onApprove()
      }

      return new Promise<null>((resolve) => resolve(null))
    })

    if (receipt?.status) {
      toastSuccess(t('Contract Enabled'), <ToastDescriptionWithTx txHash={receipt.transactionHash} />)
      onDone?.()
    }
  }, [onApprove, t, toastSuccess, fetchWithCatchTxError, onDone])

  const [onPresentDeposit] = useModal(
    <FarmWidget.DepositModal
      account={account}
      pid={pid}
      lpTotalSupply={lpTotalSupply}
      max={tokenBalance}
      lpPrice={lpTokenPrice}
      lpLabel={lpLabel}
      apr={apr}
      displayApr={displayApr}
      stakedBalance={stakedBalance}
      tokenName={lpSymbol}
      multiplier={multiplier}
      addLiquidityUrl={addLiquidityUrl}
      cakePrice={cakePrice}
      showActiveBooster={boosterState === YieldBoosterState.ACTIVE}
      showCrossChainFarmWarning={chainId !== DEFAULT_CHAIN_ID && chainId !== DEFAULT_TESTNET_ID}
      crossChainWarningText={crossChainWarningText}
      decimals={18}
      allowance={allowance}
      enablePendingTx={pendingTx}
      lpRewardsApr={lpRewardsApr}
      onConfirm={handleStake}
      handleApprove={handleApprove}
    />,
    true,
    true,
    `farm-deposit-modal-${pid}`,
    [
      account,
      pid,
      lpTotalSupply,
      tokenBalance,
      lpTokenPrice,
      lpLabel,
      apr,
      displayApr,
      stakedBalance,
      lpSymbol,
      multiplier,
      addLiquidityUrl,
      cakePrice,
      boosterState,
      chainId,
      crossChainWarningText,
      lpRewardsApr,
      allowance,
      pendingTx,
    ],
  )

  const [onPresentWithdraw] = useModal(
    <FarmWidget.WithdrawModal
      showActiveBooster={boosterState === YieldBoosterState.ACTIVE}
      max={stakedBalance}
      onConfirm={handleUnstake}
      lpPrice={lpTokenPrice}
      tokenName={lpSymbol}
      decimals={18}
      showCrossChainFarmWarning={chainId !== DEFAULT_CHAIN_ID && chainId !== DEFAULT_TESTNET_ID}
    />,
  )

  const [onPresentTransactionModal] = useModal(<WalletModal initialView="Transactions" />)

  const onClickLoadingIcon = () => {
    const { length } = pendingFarm
    if (length) {
      if (length > 1) {
        onPresentTransactionModal()
      } else {
        dispatch(pickFarmTransactionTx({ tx: pendingFarm[0].txid, chainId }))
      }
    }
  }

  if (!account) {
    return (
      <FarmWidget.FarmTable.AccountNotConnect>
        <ConnectWalletButton />
      </FarmWidget.FarmTable.AccountNotConnect>
    )
  }

  if (!isApproved && stakedBalance?.eq(0)) {
    // return <FarmWidget.FarmTable.EnableStakeAction pendingTx={pendingTx || isBloctoETH} handleApprove={handleApprove} />
    return <FarmWidget.FarmTable.EnableStakeAction pendingTx={pendingTx} handleApprove={handleApprove} />
  }

  if (!userDataReady) {
    return <FarmWidget.FarmTable.StakeActionDataNotReady />
  }

  if (stakedBalance?.gt(0)) {
    return (
      <FarmWidget.FarmTable.StakedActionComponent
        lpSymbol={lpSymbol}
        disabledMinusButton={pendingFarm.length > 0}
        // disabledPlusButton={isStakeReady || isBloctoETH}
        disabledPlusButton={isStakeReady}
        onPresentWithdraw={onPresentWithdraw}
        onPresentDeposit={onPresentDeposit}
      >
        <FarmWidget.StakedLP
          decimals={18}
          stakedBalance={stakedBalance}
          quoteTokenSymbol={
            WNATIVE[chainId]?.symbol === quoteToken.symbol ? NATIVE[chainId]?.symbol : quoteToken.symbol
          }
          tokenSymbol={WNATIVE[chainId]?.symbol === token.symbol ? NATIVE[chainId]?.symbol : token.symbol}
          lpTotalSupply={lpTotalSupply}
          lpTokenPrice={lpTokenPrice}
          tokenAmountTotal={tokenAmountTotal}
          quoteTokenAmountTotal={quoteTokenAmountTotal}
          pendingFarmLength={pendingFarm.length}
          onClickLoadingIcon={onClickLoadingIcon}
        />
      </FarmWidget.FarmTable.StakedActionComponent>
    )
  }

  return (
    <FarmWidget.FarmTable.StakeComponent
      lpSymbol={lpSymbol}
      isStakeReady={isStakeReady}
      onPresentDeposit={onPresentDeposit}
    />
  )
}

export default Staked
