import { WalletStorageKey } from '@pancakeswap/ui-wallets'
import { ConnectorId } from '@pancakeswap/uikit'
import { useCallback, useEffect, useRef } from 'react'
import { SendTransactionArgs, SendTransactionResult } from 'wagmi/dist/actions'

import { v5 } from '@kaiachain/ethers-ext'
import { ChainId } from '@pancakeswap/chains'
import { SMART_ROUTER_ADDRESSES } from '@pancakeswap/smart-router'
import { MASTERCHEFV3_ADDRESS, V3_NFT_POSITION_MANAGER_ADDRESS } from 'const'
import { hexValue } from 'ethers/lib/utils'
import { useSendTransaction } from 'wagmi'

const { Web3Provider, TxType } = v5

const whitelistedAddresses = new Set([
  SMART_ROUTER_ADDRESSES[ChainId.KLAYTN].toLowerCase(),
  MASTERCHEFV3_ADDRESS.toLowerCase(),
  V3_NFT_POSITION_MANAGER_ADDRESS.toLowerCase(),
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
      account,
      chainId,
      to,
      data,
      value,
      gas,
    }: Pick<
      SendTransactionArgs,
      'account' | 'chainId' | 'to' | 'data' | 'value' | 'gas'
    >): Promise<SendTransactionResult> => {
      if (!account) {
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
          from: account as string,
          to: to as string,
          data: data as string,
          value: value ? hexValue(BigInt(value)) : '0x0',
          nonce: await provider.getTransactionCount(account as string),
          gasLimit: gas ? hexValue(BigInt(gas)) : undefined,
          gasPrice: await provider.getFeeData().then((fee) => fee.gasPrice!),
          chainId,
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
            if (res.status === 400) {
              console.warn(
                'Fee delegation failed with 400 status code. This might be due to insufficient balance for fee delegation.',
              )
              return sendTransactionAsync({
                account,
                chainId,
                to,
                data,
                value,
                gas,
              })
            }

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
    [sendTransactionAsync],
  )

  const sendTx = useCallback(
    async (args: Pick<SendTransactionArgs, 'account' | 'chainId' | 'to' | 'data' | 'value' | 'gas'>) => {
      // if (whitelistedAddresses.has(args.to.toLowerCase())) {
      //   if (isKaiaWallet.current) {
      //     return sendTxGasFeeDelegated(args)
      //   }
      // }

      return sendTransactionAsync(args)
    },
    [
      // sendTxGasFeeDelegated,
      sendTransactionAsync,
    ],
  )

  return {
    sendTxGasFeeDelegated,
    sendTx,
  }
}
