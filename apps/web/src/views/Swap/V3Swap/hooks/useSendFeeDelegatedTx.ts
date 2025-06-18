import { WalletStorageKey } from '@pancakeswap/ui-wallets'
import { ConnectorId } from '@pancakeswap/uikit'
import { useCallback, useEffect, useRef } from 'react'
import { SendTransactionArgs, SendTransactionResult } from 'wagmi/dist/actions'

import { v5 } from '@kaiachain/ethers-ext'
import { hexValue } from 'ethers/lib/utils'
import { useSendTransaction } from 'wagmi'

const { Web3Provider, TxType } = v5

const whitelistedAddresses = new Set([
  '0x5EA3e22C41B08DD7DC7217549939d987ED410354'.toLowerCase(), // smart router
])

export function useSendFeeDelegatedTx() {
  const { sendTransactionAsync } = useSendTransaction()
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
      if (whitelistedAddresses.has(args.to.toLowerCase())) {
        if (isKaiaWallet.current) {
          return sendTxGasFeeDelegated(args)
        }
      }

      return sendTransactionAsync(args)
    },
    [sendTxGasFeeDelegated, sendTransactionAsync],
  )

  return {
    sendTxGasFeeDelegated,
    sendTx,
  }
}
