import { Currency, Token, TradeType } from '@pancakeswap/sdk'
import { SmartRouterTrade } from '@pancakeswap/smart-router/evm'
import { useQuery } from '@tanstack/react-query'
import type WallchainSDK from '@wallchain/sdk'
import type { TMEVFoundResponse } from '@wallchain/sdk'
import { TOptions } from '@wallchain/sdk'
import { atom, useAtom } from 'jotai'
import { useEffect, useState } from 'react'
import { useWalletClient } from 'wagmi'

import { WallchainKeys } from 'config/wallchain'
import { Address, Hex } from 'viem'

interface SwapCall {
  address: Address
  calldata: Hex
  value: Hex
}
interface WallchainSwapCall {
  getCall: () => Promise<SwapCall | { error: Error }>
}

export type WallchainStatus = 'found' | 'pending' | 'not-found'
export type TWallchainMasterInput = [TMEVFoundResponse['searcherRequest'], string | undefined] | undefined

const addresses = {
  // MetaSwapWrapper
  56: '0xC0ffeE00c3F5A11369EeB57693C56Fd939dc6DBb',
}
const permitAddresses = {
  56: '0x31c2F6fcFf4F8759b3Bd5Bf0e1084A055615c768',
}

const originators = {
  56: ['0xaAB27a41646A4b7e660f2BFc6e22a41550665fef'],
}

const loadData = async (account: string, sdk: WallchainSDK, swapCalls: SwapCall[]) => {
  if (await sdk.supportsChain()) {
    const approvalFor = await sdk.getSpenderForAllowance()

    try {
      const resp = await sdk.checkForMEV({
        from: account,
        to: swapCalls[0].address,
        value: swapCalls[0].value,
        data: swapCalls[0].calldata,
      })
      if (resp.MEVFound) {
        return ['found', approvalFor, resp.searcherRequest, resp.searcherSignature, resp.suggestedGas] as const
      }
    } catch (e) {
      return ['not-found', undefined, undefined, undefined, undefined]
    }
  }
  return ['not-found', undefined, undefined, undefined, undefined]
}

const extractAddressFromCurrency = (currency: Currency): `0x${string}` => {
  return currency.isNative ? '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE' : (currency as Token).address
}

const extractTokensFromTrade = (trade: SmartRouterTrade<TradeType> | undefined | null) => {
  const inputCurrency = trade?.inputAmount?.currency
  const outputCurrency = trade?.outputAmount?.currency
  const srcToken = inputCurrency ? extractAddressFromCurrency(inputCurrency) : false
  const dstToken = outputCurrency ? extractAddressFromCurrency(outputCurrency) : false

  return [srcToken, dstToken] as [false | `0x${string}`, false | `0x${string}`]
}

function useWallchainSDK() {
  const { data: walletClient } = useWalletClient()
  const { data: wallchainSDK } = useQuery(
    ['wallchainSDK', walletClient?.account, walletClient?.chain],
    async () => {
      const WallchainSDK = (await import('@wallchain/sdk')).default
      return new WallchainSDK({
        keys: WallchainKeys as { [key: string]: string },
        provider: walletClient?.transport as TOptions['provider'],
        addresses,
        permitAddresses,
        originators,
      })
    },
    {
      // enabled: Boolean(chainId === ChainId.BSC && walletClient && WALLCHAIN_ENABLED),
      enabled: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false,
    },
  )

  return wallchainSDK
}

const wallchainStatusAtom = atom<WallchainStatus>('pending')
export function useWallchainStatus() {
  return useAtom(wallchainStatusAtom)
}

export function useWallchainSwapCallArguments(
  trade: SmartRouterTrade<TradeType> | undefined | null,
  previousSwapCalls: { address: `0x${string}`; calldata: `0x${string}`; value: `0x${string}` }[] | undefined | null,
  account: string | undefined | null,
  onWallchainDrop: () => void,
  masterInput?: [TMEVFoundResponse['searcherRequest'], string],
): SwapCall[] | WallchainSwapCall[] {
  const [swapCalls, setSwapCalls] = useState<SwapCall[] | WallchainSwapCall[]>([])
  const { data: walletClient } = useWalletClient()

  const [srcToken, dstToken] = extractTokensFromTrade(trade)
  const isNative = trade?.inputAmount?.currency?.isNative
  const amountIn = trade?.inputAmount?.numerator?.toString() as `0x${string}`
  const needPermit = !trade?.inputAmount?.currency?.isNative

  const sdk = useWallchainSDK()

  useEffect(() => {
    if (
      !walletClient ||
      !masterInput ||
      !masterInput[0] ||
      !srcToken ||
      !dstToken ||
      !amountIn ||
      !previousSwapCalls ||
      !previousSwapCalls[0] ||
      !sdk ||
      !account
    ) {
      if (!previousSwapCalls || !previousSwapCalls.length) {
        setSwapCalls([])
      } else {
        setSwapCalls(previousSwapCalls)
      }

      return
    }

    loadData(account, sdk, previousSwapCalls).then(async (response) => {
      const [status, _approvalAddress, searcherRequest, searcherSignature, suggestedGas] = response as [
        WallchainStatus,
        string | undefined,
        TMEVFoundResponse['searcherRequest'] | undefined,
        string | undefined,
        string | undefined,
      ]
      if (status === 'not-found') {
        if (isNative) {
          setSwapCalls(previousSwapCalls)
        } else {
          // if previous call succeded but MEV disappeared need to reset allowance flow
          const callback = async () => {
            onWallchainDrop()
            return {
              error: new Error('MEV not found'),
            }
          }
          setSwapCalls([{ getCall: callback }])
        }
      } else {
        const callback = async () => {
          try {
            const spender = (await sdk.getSpender()) as `0x${string}`
            let witness: false | Awaited<ReturnType<typeof sdk.signPermit>> = false

            if (needPermit) {
              witness = await sdk.signPermit(srcToken, account, spender, amountIn)
            }

            const data = await sdk.createNewTransaction(
              previousSwapCalls[0].address,
              previousSwapCalls[0].address,
              false,
              previousSwapCalls[0].calldata,
              amountIn,
              previousSwapCalls[0].value,
              srcToken,
              dstToken,
              searcherSignature as `0x${string}`,
              searcherRequest as unknown as TMEVFoundResponse['searcherRequest'],
              witness,
            )

            return {
              address: data.to as `0x${string}`,
              calldata: data.data as `0x${string}`,
              value: data.value as `0x${string}`,
              gas: suggestedGas,
            }
          } catch (error) {
            return { error } as { error: Error }
          }
        }

        setSwapCalls([{ getCall: callback }])
      }
    })
  }, [
    account,
    previousSwapCalls,
    masterInput,
    srcToken,
    dstToken,
    amountIn,
    needPermit,
    walletClient,
    sdk,
    onWallchainDrop,
    isNative,
  ])

  return swapCalls
}
