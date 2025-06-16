import { ChainId } from '@pancakeswap/chains'
import { useTranslation } from '@pancakeswap/localization'
import { TradeType } from '@pancakeswap/sdk'
import { SmartRouter, SmartRouterTrade } from '@pancakeswap/smart-router/evm'
import { formatAmount } from '@pancakeswap/utils/formatFractions'
import truncateHash from '@pancakeswap/utils/truncateHash'
import { useUserSlippage } from '@pancakeswap/utils/user'
import { INITIAL_ALLOWED_SLIPPAGE } from 'config/constants'
import { hexValue } from 'ethers/lib/utils'
import { useCallback, useEffect, useRef } from 'react'
import { useSwapState } from 'state/swap/hooks'
import { useTransactionAdder } from 'state/transactions/hooks'
import { calculateGasMargin, safeGetAddress } from 'utils'
import { basisPointsToPercent } from 'utils/exchange'
import { logSwap, logTx } from 'utils/log'
import { isUserRejected } from 'utils/sentry'
import { transactionErrorToUserReadableMessage } from 'utils/transactionErrorToUserReadableMessage'
import { viemClients } from 'utils/viem'
import { Address, Hex, hexToBigInt, TransactionExecutionError } from 'viem'
import { useSendTransaction } from 'wagmi'
import { SendTransactionArgs, SendTransactionResult } from 'wagmi/actions'

import { v5 } from '@kaiachain/ethers-ext'
import { WalletStorageKey } from '@pancakeswap/ui-wallets'
import { ConnectorId } from '@pancakeswap/uikit'
import { logger } from 'utils/datadog'
import { isZero } from '../utils/isZero'

const { Web3Provider, TxType } = v5

interface SwapCall {
  address: Address
  calldata: Hex
  value: Hex
}

interface WallchainSwapCall {
  getCall: () => Promise<SwapCall & { gas: string }>
}

interface SwapCallEstimate {
  call: SwapCall | WallchainSwapCall
}

interface SuccessfulCall extends SwapCallEstimate {
  call: SwapCall | WallchainSwapCall
  gasEstimate: bigint
}

interface FailedCall extends SwapCallEstimate {
  call: SwapCall | WallchainSwapCall
  error: Error
}

export class TransactionRejectedError extends Error {}

// returns a function that will execute a swap, if the parameters are all valid
export default function useSendSwapTransaction(
  account?: Address,
  chainId?: number,
  trade?: SmartRouterTrade<TradeType> | null, // trade to execute, required
  swapCalls: SwapCall[] | WallchainSwapCall[] = [],
): { callback: null | (() => Promise<SendTransactionResult>) } {
  const { t } = useTranslation()
  const addTransaction = useTransactionAdder()
  const { sendTransactionAsync } = useSendTransaction()
  const publicClient = viemClients[chainId as ChainId]
  const [allowedSlippage] = useUserSlippage() || [INITIAL_ALLOWED_SLIPPAGE]
  const { recipient } = useSwapState()
  const recipientAddress = recipient === null ? account : recipient

  const isKaiaWallet = useRef(false)

  useEffect(() => {
    const timer = setInterval(() => {
      isKaiaWallet.current =
        (localStorage.getItem(WalletStorageKey.CONNECTOR) as ConnectorId) === 'kaiawallet' &&
        !!((window as any).kaia || (window as any).klaytn)
    }, 500)

    return () => {
      clearInterval(timer)
    }
  }, [])

  const sendTxGasFeeDelegated = useCallback(
    async ({
      account: _account,
      chainId: _chainId,
      to,
      data,
      value,
      gas,
    }: Pick<
      SendTransactionArgs,
      'account' | 'chainId' | 'to' | 'data' | 'value' | 'gas'
    >): Promise<SendTransactionResult> => {
      if (!_account) {
        throw new Error('Wallet not connected.')
      }
      // Use window.klaytn or window.kaia based on availability
      const kaikasProvider = (window as any).kaia || (window as any).klaytn
      if (!kaikasProvider) {
        throw new Error('Kaia Wallet client not found (window.klaytn or window.kaia missing).')
      }

      const provider = new Web3Provider(kaikasProvider)

      try {
        const txForSigning = {
          type: TxType.FeeDelegatedSmartContractExecution,
          from: _account as string,
          to: to as string,
          data: data as string,
          value: value ? hexValue(BigInt(value)) : '0x0',
          nonce: await provider.getTransactionCount(_account as string),
          gasLimit: gas ? hexValue(BigInt(gas)) : undefined,
          gasPrice: await provider.getFeeData().then((fee) => fee.gasPrice!),
          chainId: _chainId,
        }

        const signer = provider.getSigner()
        const signedTx = await signer.signTransaction(txForSigning)

        const result = await fetch('/api/fee-delegated-tx', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            senderSignedTx: signedTx,
          }),
        }).then(async (res) => {
          if (!res.ok) {
            return res.text().then((text) => {
              console.error('Server error response:', text)
              throw new Error(`Failed to send fee delegated transaction: ${res.status} ${res.statusText} - ${text}`)
            })
          }
          return res.json()
        })

        return result
      } catch (error: any) {
        if (error.code === 4001 || (error.message && error.message.includes('User denied transaction signature'))) {
          throw new Error('Transaction signing denied by user.')
        }

        throw error
      }
    },
    [],
  )

  const sendTx = useCallback(
    async (args: Pick<SendTransactionArgs, 'account' | 'chainId' | 'to' | 'data' | 'value' | 'gas'>) => {
      // return sendTransactionAsync(args)

      return isKaiaWallet.current ? sendTxGasFeeDelegated(args) : sendTransactionAsync(args)
    },
    [sendTxGasFeeDelegated, sendTransactionAsync],
  )

  if (!trade || !sendTransactionAsync || !account || !chainId || !publicClient) {
    return { callback: null }
  }

  return {
    callback: async function onSwap(): Promise<SendTransactionResult> {
      const estimatedCalls: SwapCallEstimate[] = await Promise.all(
        swapCalls.map((call) => {
          const { address, calldata, value } = call
          if ('getCall' in call) {
            // Only WallchainSwapCall, don't use rest of pipeline
            return {
              call,
              gasEstimate: undefined,
            }
          }
          const tx =
            !value || isZero(value)
              ? { account, to: address, data: calldata, value: 0n }
              : {
                  account,
                  to: address,
                  data: calldata,
                  value: hexToBigInt(value),
                }

          return publicClient
            .estimateGas(tx)
            .then((gasEstimate) => {
              return {
                call,
                gasEstimate,
              }
            })
            .catch((gasError) => {
              console.debug('Gas estimate failed, trying to extract error', call, gasError)
              return { call, error: transactionErrorToUserReadableMessage(gasError, t) }
            })
        }),
      )

      // a successful estimation is a bignumber gas estimate and the next call is also a bignumber gas estimate
      let bestCallOption: SuccessfulCall | SwapCallEstimate | undefined = estimatedCalls.find(
        (el, ix, list): el is SuccessfulCall =>
          'gasEstimate' in el && (ix === list.length - 1 || 'gasEstimate' in list[ix + 1]),
      )

      // check if any calls errored with a recognizable error
      if (!bestCallOption) {
        const errorCalls = estimatedCalls.filter((call): call is FailedCall => 'error' in call)
        if (errorCalls.length > 0) throw errorCalls[errorCalls.length - 1].error
        const firstNoErrorCall = estimatedCalls.find<SwapCallEstimate>(
          (call): call is SwapCallEstimate => !('error' in call),
        )
        if (!firstNoErrorCall) throw new Error(t('Unexpected error. Could not estimate gas for the swap.'))
        bestCallOption = firstNoErrorCall
      }

      const call =
        'getCall' in bestCallOption.call
          ? await bestCallOption.call.getCall()
          : (bestCallOption.call as SwapCall & { gas?: string | bigint })

      if ('error' in call) {
        throw new Error('Route lost. Need to restart.')
      }

      if ('gas' in call && call.gas) {
        // prepared Wallchain's call have gas estimate inside
        call.gas = BigInt(call.gas)
      } else {
        call.gas =
          'gasEstimate' in bestCallOption && bestCallOption.gasEstimate
            ? calculateGasMargin(bestCallOption.gasEstimate)
            : undefined
      }

      return sendTx({
        account,
        chainId,
        to: call.address,
        data: call.calldata,
        value: call.value && !isZero(call.value) ? hexToBigInt(call.value) : 0n,
        gas: call.gas,
      })
        .then((response) => {
          const inputSymbol = trade.inputAmount.currency.symbol
          const outputSymbol = trade.outputAmount.currency.symbol
          const pct = basisPointsToPercent(allowedSlippage)
          const inputAmount =
            trade.tradeType === TradeType.EXACT_INPUT
              ? formatAmount(trade.inputAmount, 3)
              : formatAmount(SmartRouter.maximumAmountIn(trade, pct), 3)
          const outputAmount =
            trade.tradeType === TradeType.EXACT_OUTPUT
              ? formatAmount(trade.outputAmount, 3)
              : formatAmount(SmartRouter.minimumAmountOut(trade, pct), 3)

          const base = `Swap ${
            trade.tradeType === TradeType.EXACT_OUTPUT ? 'max. ' : ''
          }${inputAmount} ${inputSymbol} for ${
            trade.tradeType === TradeType.EXACT_INPUT ? 'min. ' : ''
          }${outputAmount} ${outputSymbol}`

          const recipientAddressText =
            recipientAddress && safeGetAddress(recipientAddress) ? truncateHash(recipientAddress) : recipientAddress

          const withRecipient = recipient === account ? base : `${base} to ${recipientAddressText}`

          const translatableWithRecipient =
            trade.tradeType === TradeType.EXACT_OUTPUT
              ? !recipient || recipient === account
                ? 'Swap max. {{inputAmount}} {{inputSymbol}} for {{outputAmount}} {{outputSymbol}}'
                : 'Swap max. {{inputAmount}} {{inputSymbol}} for {{outputAmount}} {{outputSymbol}} to {{recipientAddress}}'
              : !recipient || recipient === account
              ? 'Swap {{inputAmount}} {{inputSymbol}} for min. {{outputAmount}} {{outputSymbol}}'
              : 'Swap {{inputAmount}} {{inputSymbol}} for min. {{outputAmount}} {{outputSymbol}} to {{recipientAddress}}'
          addTransaction(response, {
            summary: withRecipient,
            translatableSummary: {
              text: translatableWithRecipient,
              data: {
                inputAmount,
                inputSymbol,
                outputAmount,
                outputSymbol,
                ...(recipient !== account && { recipientAddress: recipientAddressText }),
              },
            },
            type: 'swap',
          })
          logSwap({
            account,
            chainId,
            hash: response.hash,
            inputAmount,
            outputAmount,
            input: trade.inputAmount.currency,
            output: trade.outputAmount.currency,
            type: 'V3SmartSwap',
          })
          logTx({ account, chainId, hash: response.hash })
          return response
        })
        .catch((error) => {
          // if the user rejected the tx, pass this along
          if (isUserRejected(error)) {
            throw new TransactionRejectedError(t('Transaction rejected'))
          } else {
            // otherwise, the error was unexpected and we need to convey that
            logger.warn(
              'Swap failed',
              {
                chainId,
                input: trade.inputAmount.currency,
                output: trade.outputAmount.currency,
                address: call.address,
                value: call.value,
                cause: error instanceof TransactionExecutionError ? error.cause : undefined,
              },
              error,
            )

            throw new Error(`Swap failed: ${transactionErrorToUserReadableMessage(error, t)}`)
          }
        })
    },
  }
}
