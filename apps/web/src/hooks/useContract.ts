import { getPoolContractBySousId } from '@pancakeswap/pools'

import { Abi, Address } from 'viem'
import { erc20ABI, usePublicClient, useWalletClient } from 'wagmi'

import { useActiveChainId } from 'hooks/useActiveChainId'

import addresses from 'config/constants/contracts'
import { useMemo } from 'react'
import { getMulticallAddress, getZapAddress } from 'utils/addressHelpers'
import {
  getBCakeFarmBoosterContract,
  getBCakeFarmBoosterProxyFactoryContract,
  getBCakeProxyContract,
  getCakeFlexibleSideVaultV2Contract,
  getCakeVaultV2Contract,
  getChainlinkOracleContract,
  getContract,
  getCrossFarmingProxyContract,
  getFixedStakingContract,
  getMasterChefContract,
  getMasterChefV3Contract,
  getNonBscVaultContract,
  getPositionManagerAdapterContract,
  getPositionManagerWrapperContract,
  getPotteryVaultContract,
  getRevenueSharingCakePoolContract,
  getRevenueSharingPoolGatewayContract,
  getRevenueSharingVeCakeContract,
  getSidContract,
  getStableSwapNativeHelperContract,
  getTradingRewardContract,
  getTradingRewardTopTradesContract,
  getUnsContract,
  getV3AirdropContract,
  getV3MigratorContract,
  getVCakeContract,
  getVeCakeContract,
} from 'utils/contractHelpers'

import { ChainId } from '@pancakeswap/chains'
import { ifoV7ABI } from '@pancakeswap/ifos'
import { WNATIVE, WNATIVE2, pancakePairV2ABI } from '@pancakeswap/sdk'
import { nonfungiblePositionManagerABI } from '@pancakeswap/v3-sdk'
import { multicallABI } from 'config/abi/Multicall'
import { erc20Bytes32ABI } from 'config/abi/erc20_bytes32'
import { ifoV1ABI } from 'config/abi/ifoV1'
import { ifoV2ABI } from 'config/abi/ifoV2'
import { ifoV3ABI } from 'config/abi/ifoV3'
import { zapABI } from 'config/abi/zap'
import { VaultKey } from 'state/types'

import { CAKE } from '@pancakeswap/tokens'
import { erc721CollectionABI } from 'config/abi/erc721collection'
import { infoStableSwapABI } from 'config/abi/infoStableSwap'
import { neopin } from 'config/abi/neopin'
import { wethABI } from 'config/abi/weth'
/**
 * Helper hooks to get specific contracts (by ABI)
 */

export const useIfoV1Contract = (address: Address) => {
  return useContract(address, ifoV1ABI)
}

export const useIfoV2Contract = (address: Address) => {
  return useContract(address, ifoV2ABI)
}

export const useIfoV3Contract = (address: Address) => {
  return useContract(address, ifoV3ABI)
}

export const useIfoV7Contract = (address: Address, options?: UseContractOptions) => {
  return useContract(address, ifoV7ABI, options)
}

export const useERC20 = (address: Address, options?: UseContractOptions) => {
  return useContract(address, erc20ABI, options)
}

export const useCake = () => {
  const { chainId } = useActiveChainId()

  return useContract((chainId && CAKE[chainId]?.address) ?? CAKE[ChainId.KLAYTN].address, erc20ABI)
}

export const useMasterchef = () => {
  const { chainId } = useActiveChainId()
  const { data: signer } = useWalletClient()
  return useMemo(() => getMasterChefContract(signer ?? undefined, chainId), [signer, chainId])
}

export const useSousChef = (id) => {
  const { data: signer } = useWalletClient()
  const { chainId } = useActiveChainId()
  const publicClient = usePublicClient({ chainId })
  return useMemo(
    () =>
      getPoolContractBySousId({
        sousId: id,
        signer,
        chainId,
        publicClient,
      }),
    [id, signer, chainId, publicClient],
  )
}

export const useVaultPoolContract = <T extends VaultKey>(
  vaultKey: T,
):
  | (T extends VaultKey.CakeVault
      ? ReturnType<typeof getCakeVaultV2Contract>
      : ReturnType<typeof getCakeFlexibleSideVaultV2Contract>)
  | null => {
  const { chainId } = useActiveChainId()
  const { data: signer } = useWalletClient()
  return useMemo(() => {
    if (vaultKey === VaultKey.CakeVault) {
      return getCakeVaultV2Contract(signer ?? undefined, chainId)
    }
    if (vaultKey === VaultKey.CakeFlexibleSideVault) {
      return getCakeFlexibleSideVaultV2Contract(signer ?? undefined, chainId)
    }
    return null
  }, [signer, vaultKey, chainId]) as any
}

export const useCakeVaultContract = () => {
  const { data: signer } = useWalletClient()
  const { chainId } = useActiveChainId()
  return useMemo(() => getCakeVaultV2Contract(signer ?? undefined, chainId), [signer, chainId])
}

export const useChainlinkOracleContract = (address) => {
  const { data: signer } = useWalletClient()
  return useMemo(() => getChainlinkOracleContract(address, signer ?? undefined), [signer, address])
}

export const useErc721CollectionContract = (collectionAddress: Address) => {
  return useContract(collectionAddress, erc721CollectionABI)
}

// Code below migrated from Exchange useContract.ts

type UseContractOptions = {
  chainId?: ChainId
}

// returns null on errors
export function useContract<TAbi extends Abi>(
  addressOrAddressMap?: Address | { [chainId: number]: Address },
  abi?: TAbi,
  options?: UseContractOptions,
) {
  const { chainId: currentChainId } = useActiveChainId()
  const chainId = options?.chainId || currentChainId
  const { data: walletClient } = useWalletClient()

  return useMemo(() => {
    if (!addressOrAddressMap || !abi || !chainId) return null
    let address: Address | undefined
    if (typeof addressOrAddressMap === 'string') address = addressOrAddressMap
    else address = addressOrAddressMap[chainId]
    if (!address) return null
    try {
      return getContract({
        abi,
        address,
        chainId,
        signer: walletClient ?? undefined,
      })
    } catch (error) {
      console.error('Failed to get contract', error)
      return null
    }
  }, [addressOrAddressMap, abi, chainId, walletClient])
}

export function useTokenContract(tokenAddress?: Address) {
  return useContract(tokenAddress, tokenAddress === '0xE06597D02A2C3AA7a9708DE2Cfa587B128bd3815' ? neopin : erc20ABI)
}

export function useWNativeContract(address?: Address) {
  const { chainId } = useActiveChainId()
  return useContract(address ?? (chainId ? WNATIVE[chainId]?.address : undefined), wethABI)
}

export function useRNativeContract() {
  const { chainId } = useActiveChainId()
  return useContract(chainId ? WNATIVE2[chainId]?.address : undefined, wethABI)
}

export function useBytes32TokenContract(tokenAddress?: Address) {
  return useContract(tokenAddress, erc20Bytes32ABI)
}

export function usePairContract(pairAddress?: Address, options?: UseContractOptions) {
  return useContract(pairAddress, pancakePairV2ABI, options)
}

export function useMulticallContract() {
  const { chainId } = useActiveChainId()
  return useContract(getMulticallAddress(chainId), multicallABI)
}

export const usePotterytVaultContract = (address: Address) => {
  const { data: signer } = useWalletClient()
  return useMemo(() => getPotteryVaultContract(address, signer ?? undefined), [address, signer])
}

export function useZapContract() {
  const { chainId } = useActiveChainId()
  return useContract(getZapAddress(chainId), zapABI)
}

export function useBCakeFarmBoosterContract() {
  const { data: signer } = useWalletClient()
  return useMemo(() => getBCakeFarmBoosterContract(signer ?? undefined), [signer])
}

export function usePositionManagerWrapperContract(address: Address) {
  const { chainId } = useActiveChainId()
  const { data: signer } = useWalletClient()
  return useMemo(
    () => getPositionManagerWrapperContract(address, signer ?? undefined, chainId),
    [signer, chainId, address],
  )
}

export function usePositionManagerAdepterContract(address: Address) {
  const { chainId } = useActiveChainId()
  const { data: signer } = useWalletClient()
  return useMemo(
    () => getPositionManagerAdapterContract(address, signer ?? undefined, chainId),
    [signer, chainId, address],
  )
}

export function useBCakeFarmBoosterProxyFactoryContract() {
  const { data: signer } = useWalletClient()
  return useMemo(() => getBCakeFarmBoosterProxyFactoryContract(signer ?? undefined), [signer])
}

export function useBCakeProxyContract(proxyContractAddress: Address) {
  const { data: signer } = useWalletClient()
  return useMemo(
    () => proxyContractAddress && getBCakeProxyContract(proxyContractAddress, signer ?? undefined),
    [signer, proxyContractAddress],
  )
}

export const useNonBscVault = () => {
  const { chainId } = useActiveChainId()
  const { data: signer } = useWalletClient()
  return useMemo(() => getNonBscVaultContract(signer ?? undefined, chainId), [signer, chainId])
}

export const useSIDContract = (address, chainId) => {
  return useMemo(() => getSidContract(address, chainId), [address, chainId])
}

export const useUNSContract = (address, chainId, provider) => {
  return useMemo(() => getUnsContract(address, chainId, provider), [chainId, address, provider])
}

export const useCrossFarmingProxy = (proxyContractAddress: Address) => {
  const { chainId } = useActiveChainId()
  const { data: signer } = useWalletClient()
  return useMemo(
    () => proxyContractAddress && getCrossFarmingProxyContract(proxyContractAddress, signer ?? undefined, chainId),
    [proxyContractAddress, signer, chainId],
  )
}

export const useStableSwapNativeHelperContract = () => {
  const { chainId } = useActiveChainId()
  const { data: signer } = useWalletClient()
  return useMemo(() => getStableSwapNativeHelperContract(signer ?? undefined, chainId), [signer, chainId])
}

export function useV3NFTPositionManagerContract() {
  return useContract(addresses.nftPositionManager, nonfungiblePositionManagerABI)
}

export function useMasterchefV3(isFinished?: boolean) {
  const { chainId } = useActiveChainId()
  const { data: signer } = useWalletClient()
  return useMemo(() => getMasterChefV3Contract(signer ?? undefined, chainId, isFinished), [signer, chainId, isFinished])
}

export function useV3MigratorContract() {
  const { chainId } = useActiveChainId()
  const { data: signer } = useWalletClient()
  return useMemo(() => getV3MigratorContract(signer ?? undefined, chainId), [chainId, signer])
}

export const useTradingRewardContract = ({ chainId: chainId_ }: { chainId?: ChainId } = {}) => {
  const { chainId } = useActiveChainId()
  const { data: signer } = useWalletClient()
  return useMemo(() => getTradingRewardContract(signer ?? undefined, chainId_ ?? chainId), [signer, chainId_, chainId])
}

export const useV3AirdropContract = () => {
  const { data: signer } = useWalletClient()
  return useMemo(() => getV3AirdropContract(signer ?? undefined), [signer])
}

export const useInfoStableSwapContract = (infoAddress?: Address) => {
  return useContract(infoAddress, infoStableSwapABI)
}

export const useTradingRewardTopTraderContract = ({ chainId: chainId_ }: { chainId?: ChainId } = {}) => {
  const { chainId } = useActiveChainId()
  const { data: signer } = useWalletClient()
  return useMemo(
    () => getTradingRewardTopTradesContract(signer ?? undefined, chainId_ ?? chainId),
    [signer, chainId_, chainId],
  )
}

export const useVCakeContract = ({ chainId: chainId_ }: { chainId?: ChainId } = {}) => {
  const { chainId } = useActiveChainId()
  const { data: signer } = useWalletClient()
  return useMemo(() => getVCakeContract(signer ?? undefined, chainId_ ?? chainId), [signer, chainId_, chainId])
}

export const useFixedStakingContract = () => {
  const { chainId } = useActiveChainId()

  const { data: signer } = useWalletClient()

  return useMemo(() => getFixedStakingContract(signer ?? undefined, chainId), [chainId, signer])
}

export const useVeCakeContract = () => {
  const { chainId } = useActiveChainId()

  const { data: signer } = useWalletClient()

  return useMemo(() => getVeCakeContract(signer ?? undefined, chainId), [chainId, signer])
}
export const useRevenueSharingCakePoolContract = () => {
  const { chainId } = useActiveChainId()
  const { data: signer } = useWalletClient()

  return useMemo(() => getRevenueSharingCakePoolContract(signer ?? undefined, chainId), [signer, chainId])
}

export const useRevenueSharingVeCakeContract = () => {
  const { chainId } = useActiveChainId()
  const { data: signer } = useWalletClient()

  return useMemo(() => getRevenueSharingVeCakeContract(signer ?? undefined, chainId), [signer, chainId])
}

export const useRevenueSharingPoolGatewayContract = () => {
  const { chainId } = useActiveChainId()
  const { data: signer } = useWalletClient()

  return useMemo(() => getRevenueSharingPoolGatewayContract(signer ?? undefined, chainId), [signer, chainId])
}
