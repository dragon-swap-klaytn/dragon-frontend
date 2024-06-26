import { useTranslation } from '@pancakeswap/localization'
import { Currency, CurrencyAmount, ERC20Token } from '@pancakeswap/sdk'
import { MaxUint256 } from '@pancakeswap/swap-sdk-core'
import { useModal, useToast } from '@pancakeswap/uikit'
import isUndefinedOrNull from '@pancakeswap/utils/isUndefinedOrNull'
import ApprovalConfirmationModal from 'components/ApprovalConfirmationModal'
import { createElement, useCallback, useEffect, useMemo, useState } from 'react'
import { useHasPendingApproval, useTransactionAdder } from 'state/transactions/hooks'
import { calculateGasMargin } from 'utils'
import { getViemErrorMessage } from 'utils/errors'
import { isUserRejected, logError } from 'utils/sentry'
import { Address, useAccount } from 'wagmi'
import { SendTransactionResult } from 'wagmi/actions'
import useGelatoLimitOrdersLib from './limitOrders/useGelatoLimitOrdersLib'
import { useCallWithGasPrice } from './useCallWithGasPrice'
import { useTokenContract } from './useContract'
import useTokenAllowance from './useTokenAllowance'

export enum ApprovalState {
  UNKNOWN,
  NOT_APPROVED,
  PENDING,
  APPROVED,
}

// <ApprovalConfirmationModal
// minWidth={['100%', null, '420px']}
// title={t('Confirm Approval')}
// content={() => <></>}
// hash={undefined}
// attemptingTxn
// />,

// returns a variable indicating the state of the approval and a function which approves if necessary or early returns
export function useApproveCallback(
  amountToApprove?: CurrencyAmount<Currency>,
  spender?: string,
  options: {
    addToTransaction
    targetAmount?: bigint
    useA2AQr?: boolean
  } = {
    addToTransaction: true,
    useA2AQr: true,
  },
): {
  approvalState: ApprovalState
  approveCallback: () => Promise<SendTransactionResult>
  revokeCallback: () => Promise<SendTransactionResult>
  currentAllowance: CurrencyAmount<Currency> | undefined
  isPendingError: boolean
} {
  const { addToTransaction = true, targetAmount } = options
  const { address: account } = useAccount()
  const { callWithGasPrice } = useCallWithGasPrice()
  const { t } = useTranslation()
  const { toastError } = useToast()
  const token = amountToApprove?.currency?.isToken ? amountToApprove.currency : undefined
  const { allowance: currentAllowance, refetch } = useTokenAllowance(token, account ?? undefined, spender)
  const pendingApproval = useHasPendingApproval(token?.address, spender)
  const [pending, setPending] = useState<boolean>(pendingApproval)
  const [isPendingError, setIsPendingError] = useState<boolean>(false)

  const [onPresentApprovalConfirmModal, onDismissApprovalConfirmModal] = useModal(
    createElement(ApprovalConfirmationModal, {
      minWidth: ['100%', null, '420px'],
      title: 'Confirm Approval',
      content: () => '',
      hash: undefined,
      attemptingTxn: true,
    }),

    true,
    true,
    'ApprovalConfirmationModal',
  )

  useEffect(() => {
    if (pendingApproval) {
      setPending(true)
    } else if (pending) {
      refetch().then(() => {
        setPending(false)
      })
    }
  }, [pendingApproval, pending, refetch])

  // check the current approval status
  const approvalState: ApprovalState = useMemo(() => {
    if (!amountToApprove || !spender) return ApprovalState.UNKNOWN
    if (amountToApprove.currency?.isNative) return ApprovalState.APPROVED
    // we might not have enough data to know whether or not we need to approve
    if (!currentAllowance) return ApprovalState.UNKNOWN

    // amountToApprove will be defined if currentAllowance is
    return currentAllowance.lessThan(amountToApprove)
      ? pending
        ? ApprovalState.PENDING
        : ApprovalState.NOT_APPROVED
      : ApprovalState.APPROVED
  }, [amountToApprove, currentAllowance, pending, spender])

  const tokenContract = useTokenContract(token?.address)
  const addTransaction = useTransactionAdder()

  const approve = useCallback(
    async (overrideAmountApprove?: bigint): Promise<SendTransactionResult> => {
      if (approvalState !== ApprovalState.NOT_APPROVED && isUndefinedOrNull(overrideAmountApprove)) {
        toastError(t('Error'), t('Approve was called unnecessarily'))
        console.error('approve was called unnecessarily')
        setIsPendingError(true)
        return undefined
      }
      if (!token) {
        // toastError(t('Error'), t('No token'))
        console.error('no token')
        // return undefined
      }

      if (!tokenContract) {
        toastError(t('Error'), t('Cannot find contract of the token %tokenAddress%', { tokenAddress: token?.address }))
        console.error('tokenContract is null')
        setIsPendingError(true)
        return undefined
      }

      if (!amountToApprove && isUndefinedOrNull(overrideAmountApprove)) {
        toastError(t('Error'), t('Missing amount to approve'))
        console.error('missing amount to approve')
        setIsPendingError(true)
        return undefined
      }

      if (!spender) {
        toastError(t('Error'), t('No spender'))
        console.error('no spender')
        setIsPendingError(true)
        return undefined
      }

      let useExact = false

      const estimatedGas = await tokenContract.estimateGas
        .approve(
          [spender as Address, MaxUint256], // TODO: Fix viem
          // @ts-ignore
          {
            account: tokenContract.account,
          },
        )
        .catch(() => {
          // general fallback for tokens who restrict approval amounts
          useExact = true
          if (token?.address === '0xE06597D02A2C3AA7a9708DE2Cfa587B128bd3815') {
            return tokenContract.estimateGas
              .increaseAllowance(
                [spender as Address, overrideAmountApprove ?? amountToApprove?.quotient ?? targetAmount ?? MaxUint256],
                // @ts-ignore
                {
                  account: tokenContract.account,
                },
              )
              .catch((e) => {
                console.error('estimate gas failure', e)
                toastError(t('Error'), t('Unexpected error. Could not estimate gas for the approve.'))
                setIsPendingError(true)
                return null
              })
          }
          return tokenContract.estimateGas
            .approve(
              [spender as Address, overrideAmountApprove ?? amountToApprove?.quotient ?? targetAmount ?? MaxUint256],
              // @ts-ignore
              {
                account: tokenContract.account,
              },
            )
            .catch((e) => {
              console.error('estimate gas failure', e)
              toastError(t('Error'), t('Unexpected error. Could not estimate gas for the approve.'))
              setIsPendingError(true)
              return null
            })
        })

      if (!estimatedGas) return undefined

      if (options?.useA2AQr) {
        onPresentApprovalConfirmModal()
      }

      return callWithGasPrice(
        tokenContract,
        token?.address === '0xE06597D02A2C3AA7a9708DE2Cfa587B128bd3815'
          ? ('increaseAllowance' as const)
          : ('approve' as const),
        [
          spender as Address,
          overrideAmountApprove ?? (useExact ? amountToApprove?.quotient ?? targetAmount ?? MaxUint256 : MaxUint256),
        ],
        {
          gas: calculateGasMargin(estimatedGas),
        },
      )
        .then((response) => {
          if (options?.useA2AQr) {
            onDismissApprovalConfirmModal({ force: true })
          }
          if (addToTransaction) {
            addTransaction(response, {
              summary: `Approve ${overrideAmountApprove ?? amountToApprove?.currency?.symbol}`,
              translatableSummary: {
                text: 'Approve %symbol%',
                data: { symbol: overrideAmountApprove?.toString() ?? amountToApprove?.currency?.symbol },
              },
              approval: { tokenAddress: token?.address, spender },
              type: 'approve',
            })
          }

          return response
        })
        .catch((error: any) => {
          logError(error)
          console.error('Failed to approve token', error)
          if (!isUserRejected(error)) {
            toastError(t('Error'), getViemErrorMessage(error))
          }
          throw error
        })
    },
    [
      approvalState,
      token,
      tokenContract,
      amountToApprove,
      spender,
      options?.useA2AQr,
      callWithGasPrice,
      targetAmount,
      toastError,
      t,
      onPresentApprovalConfirmModal,
      onDismissApprovalConfirmModal,
      addToTransaction,
      addTransaction,
    ],
  )

  const approveCallback = useCallback(() => {
    return approve()
  }, [approve])

  const revokeCallback = useCallback(() => {
    return approve(0n)
  }, [approve])

  return { approvalState, approveCallback, revokeCallback, currentAllowance, isPendingError }
}

export function useApproveCallbackFromAmount({
  token,
  minAmount,
  targetAmount,
  spender,
  addToTransaction,
}: {
  token?: ERC20Token
  minAmount?: bigint
  targetAmount?: bigint
  spender?: string
  addToTransaction?: boolean
}) {
  const amountToApprove = useMemo(() => {
    if (!minAmount || !token) return undefined
    return CurrencyAmount.fromRawAmount(token, minAmount)
  }, [minAmount, token])

  return useApproveCallback(amountToApprove, spender, {
    addToTransaction,
    targetAmount,
  })
}

// Wraps useApproveCallback in the context of a Gelato Limit Orders
export function useApproveCallbackFromInputCurrencyAmount(currencyAmountIn: CurrencyAmount<Currency> | undefined) {
  const gelatoLibrary = useGelatoLimitOrdersLib()

  return useApproveCallback(currencyAmountIn, gelatoLibrary?.erc20OrderRouter?.address ?? undefined)
}
