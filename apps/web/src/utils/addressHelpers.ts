import { ChainId, DEFAULT_CHAIN_ID } from '@pancakeswap/chains'
import { bCakeFarmBoosterV3Address, bCakeFarmBoosterVeCakeAddress } from '@pancakeswap/farms/constants/v3'
import addresses from 'config/constants/contracts'
import { VaultKey } from 'state/types'
import { Address } from 'viem'

export type Addresses = {
  [chainId in ChainId]?: Address
}

export const getAddressFromMap = (address: Addresses, chainId?: number): `0x${string}` => {
  return chainId && address[chainId] ? address[chainId] : address[DEFAULT_CHAIN_ID]
}

export const getAddressFromMapNoFallback = (address: Addresses, chainId?: number): `0x${string}` | null => {
  return chainId ? address[chainId] : null
}

export const getMasterChefV2Address = (chainId?: number) => {
  return getAddressFromMap(addresses.masterChef, chainId)
}

export const getMulticallAddress = (chainId?: number) => {
  return getAddressFromMap(addresses.multiCall, chainId)
}

export const getVaultPoolAddress = (vaultKey: VaultKey, chainId?: ChainId) => {
  if (!vaultKey) {
    return null
  }
  return getAddressFromMap(addresses[vaultKey], chainId)
}

export const getCakeVaultAddress = (chainId?: number) => {
  return getAddressFromMap(addresses.cakeVault, chainId)
}

export const getCakeFlexibleSideVaultAddress = (chainId?: number) => {
  return getAddressFromMap(addresses.cakeFlexibleSideVault, chainId)
}

export const getZapAddress = (chainId?: number) => {
  return getAddressFromMap(addresses.zap, chainId)
}
export const getBCakeFarmBoosterAddress = () => {
  return getAddressFromMap(addresses.bCakeFarmBooster)
}

export const getBCakeFarmBoosterV3Address = (chainId?: number) => {
  return getAddressFromMap(bCakeFarmBoosterV3Address, chainId)
}

export const getBCakeFarmBoosterVeCakeAddress = (chainId?: number) => {
  return getAddressFromMap(bCakeFarmBoosterVeCakeAddress, chainId)
}

export const getBCakeFarmBoosterProxyFactoryAddress = () => {
  return getAddressFromMap(addresses.bCakeFarmBoosterProxyFactory)
}

export const getNonBscVaultAddress = (chainId?: number) => {
  return getAddressFromMap(addresses.nonBscVault, chainId)
}

export const getCrossFarmingSenderAddress = (chainId?: number) => {
  return getAddressFromMap(addresses.crossFarmingSender, chainId)
}

export const getCrossFarmingReceiverAddress = (chainId?: number) => {
  return getAddressFromMap(addresses.crossFarmingReceiver, chainId)
}

export const getStableSwapNativeHelperAddress = (chainId?: number) => {
  return getAddressFromMap(addresses.stableSwapNativeHelper, chainId)
}

export const getMasterChefV3Address = (chainId?: number) => {
  return getAddressFromMapNoFallback(addresses.masterChefV3, chainId)
}

export const getMasterChefV3FinishedAddress = (chainId?: number) => {
  return getAddressFromMapNoFallback(addresses.masterChefV3Finished, chainId)
}

export const getV3MigratorAddress = (chainId?: number) => {
  return getAddressFromMap(addresses.v3Migrator, chainId)
}

export const getTradingRewardAddress = (chainId?: number) => {
  return getAddressFromMap(addresses.tradingReward, chainId)
}

export const getV3AirdropAddress = (chainId?: number) => {
  return getAddressFromMap(addresses.v3Airdrop, chainId)
}

export const getTradingRewardTopTradesAddress = (chainId?: number) => {
  return getAddressFromMap(addresses.tradingRewardTopTrades, chainId)
}

export const getVCakeAddress = (chainId?: number) => {
  return getAddressFromMap(addresses.vCake, chainId)
}
export const getFixedStakingAddress = (chainId?: number) => {
  return getAddressFromMap(addresses.fixedStaking, chainId)
}

export const getVeCakeAddress = (chainId?: number) => {
  return getAddressFromMap(addresses.veCake, chainId)
}
export const getRevenueSharingCakePoolAddress = (chainId?: number) => {
  return getAddressFromMap(addresses.revenueSharingCakePool, chainId)
}

export const getRevenueSharingVeCakeAddress = (chainId?: number) => {
  return getAddressFromMap(addresses.revenueSharingVeCake, chainId)
}

export const getRevenueSharingPoolGatewayAddress = (chainId?: number) => {
  return getAddressFromMap(addresses.revenueSharingPoolGateway, chainId)
}
