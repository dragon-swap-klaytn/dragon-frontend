import type { ChainId } from '@pancakeswap/chains'
import { useTranslation } from '@pancakeswap/localization'
import { SmartRouter, SmartRouterTrade } from '@pancakeswap/smart-router/evm'
import { formatAmount } from '@pancakeswap/utils/formatFractions'
import truncateHash from '@pancakeswap/utils/truncateHash'
import { useUserSlippage } from '@pancakeswap/utils/user'
import { INITIAL_ALLOWED_SLIPPAGE } from 'config/constants'
import { useSwapState } from 'state/swap/hooks'
import { useTransactionAdder } from 'state/transactions/hooks'
import { calculateGasMargin, safeGetAddress } from 'utils'
import { basisPointsToPercent } from 'utils/exchange'
import { logSwap, logTx } from 'utils/log'
import { isUserRejected } from 'utils/sentry'
import { transactionErrorToUserReadableMessage } from 'utils/transactionErrorToUserReadableMessage'
import { viemClients } from 'utils/viem'
import { Address, Hex, hexToBigInt, TransactionExecutionError } from 'viem'
import { SendTransactionResult } from 'wagmi/actions'

import { TradeType } from '@pancakeswap/swap-sdk-core'
import { JPYC_ADDRESS, TETHER_ADDRESS } from '@pancakeswap/uikit'
import { UNIFI_WALLET_GAS, UNIFI_WALLET_TYPE_INT } from 'const'
import { unifiWalletProviderAtom } from 'contexts/UnifiWalletContext'
import { useAtom } from 'jotai'
import { logger } from 'utils/datadog'
import { useSendFeeDelegatedTx } from 'views/Swap/V3Swap/hooks/useSendFeeDelegatedTx'
import { useAccount } from 'wagmi'
import { isZero } from '../utils/isZero'

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
export default function useSendSwapTransaction({
  account,
  chainId,
  trade,
  swapCalls,
}: {
  account?: Address
  chainId?: number
  trade?: SmartRouterTrade<TradeType> | null // trade to execute, required
  swapCalls: SwapCall[] | WallchainSwapCall[]
}): { callback: null | (() => Promise<SendTransactionResult>) } {
  const { t } = useTranslation()
  const addTransaction = useTransactionAdder()
  const publicClient = viemClients[chainId as ChainId]
  const [allowedSlippage] = useUserSlippage() || [INITIAL_ALLOWED_SLIPPAGE]
  const { recipient } = useSwapState()
  const recipientAddress = recipient === null ? account : recipient

  const { sendTx } = useSendFeeDelegatedTx()

  const { connector } = useAccount()

  const inputToken =
    trade?.inputAmount.currency && 'address' in trade.inputAmount.currency ? trade?.inputAmount.currency.address : null
  const inputTokenAddress = inputToken ? safeGetAddress(inputToken) : null
  const tetherAddress = safeGetAddress(TETHER_ADDRESS)
  const jpycAddress = safeGetAddress(JPYC_ADDRESS)
  const unifiDepositTokenAddress =
    inputTokenAddress === tetherAddress ? tetherAddress : inputTokenAddress === jpycAddress ? jpycAddress : null
  const isUnifiWalletWithSupportedDepositToken = connector?.id === 'unifiwallet' && !!unifiDepositTokenAddress
  const [unifiWalletProvider] = useAtom(unifiWalletProviderAtom)

  if (!trade || !account || !chainId || !publicClient) {
    return { callback: null }
  }

  return {
    callback: async function onSwap(): Promise<SendTransactionResult> {
      let estimatedCalls: SwapCallEstimate[] | undefined
      if (!isUnifiWalletWithSupportedDepositToken) {
        estimatedCalls = await Promise.all(
          swapCalls.map(async (call) => {
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
      }

      // a successful estimation is a bignumber gas estimate and the next call is also a bignumber gas estimate
      let bestCallOption: SuccessfulCall | SwapCallEstimate | undefined = estimatedCalls?.find(
        (el, ix, list): el is SuccessfulCall =>
          'gasEstimate' in el && (ix === list.length - 1 || 'gasEstimate' in list[ix + 1]),
      )

      // check if any calls errored with a recognizable error
      if (!bestCallOption && !isUnifiWalletWithSupportedDepositToken && estimatedCalls) {
        const errorCalls = estimatedCalls?.filter((call): call is FailedCall => 'error' in call) || []
        if (errorCalls.length > 0) throw errorCalls[errorCalls.length - 1].error
        const firstNoErrorCall = estimatedCalls?.find<SwapCallEstimate>(
          (call): call is SwapCallEstimate => !('error' in call),
        )
        if (!firstNoErrorCall) throw new Error(t('Unexpected error. Could not estimate gas for the swap.'))
        bestCallOption = firstNoErrorCall
      }

      const call = (
        bestCallOption
          ? 'getCall' in bestCallOption.call
            ? await bestCallOption.call.getCall()
            : bestCallOption.call
          : swapCalls[0]
      ) as SwapCall & { gas?: string | bigint }

      if (call && 'error' in call) {
        throw new Error('Route lost. Need to restart.')
      }

      if (call && 'gas' in call && call.gas && !isUnifiWalletWithSupportedDepositToken) {
        // prepared Wallchain's call have gas estimate inside
        call.gas = BigInt(call.gas)
      } else {
        call.gas =
          bestCallOption && 'gasEstimate' in bestCallOption && bestCallOption.gasEstimate
            ? calculateGasMargin(bestCallOption.gasEstimate)
            : undefined
      }

      if (isUnifiWalletWithSupportedDepositToken && unifiWalletProvider && 'request' in unifiWalletProvider) {
        return unifiWalletProvider
          .request({
            method: 'kaia_sendTransaction',
            params: [
              {
                typeInt: UNIFI_WALLET_TYPE_INT,
                from: account.toLowerCase() as string,
                to: call.address,
                input: call.calldata,
                value: '0x0',
                gas: UNIFI_WALLET_GAS,
                depositTokenAddress: unifiDepositTokenAddress.toLowerCase(),
                depositAmount: trade.inputAmount.numerator.toString(),
              },
            ],
          })
          .then((response: any) => {
            return {
              hash: response,
            }
          })
          .catch((error: any) => {
            console.error('Kaia sendTransaction failed', error)
            throw new Error(`Kaia sendTransaction failed: ${transactionErrorToUserReadableMessage(error, t)}`)
          })
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
