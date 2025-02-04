// Addresses
import {
  getBCakeFarmBoosterAddress,
  getBCakeFarmBoosterProxyFactoryAddress,
  getCakeFlexibleSideVaultAddress,
  getCrossFarmingReceiverAddress,
  getCrossFarmingSenderAddress,
  getFixedStakingAddress,
  getMasterChefV2Address,
  getMasterChefV3Address,
  getMasterChefV3FinishedAddress,
  getNonBscVaultAddress,
  getRevenueSharingCakePoolAddress,
  getRevenueSharingPoolGatewayAddress,
  getRevenueSharingVeCakeAddress,
  getStableSwapNativeHelperAddress,
  getTradingRewardAddress,
  getTradingRewardTopTradesAddress,
  getV3AirdropAddress,
  getV3MigratorAddress,
  getVCakeAddress,
  getVeCakeAddress,
} from 'utils/addressHelpers'

// ABI
import { predictionsV2ABI, predictionsV3ABI } from '@pancakeswap/prediction'
import { crossFarmingProxyABI } from 'config/abi/crossFarmingProxy'

import { ChainId } from '@pancakeswap/chains'
import { cakeFlexibleSideVaultV2ABI, cakeVaultV2ABI, getCakeVaultAddress } from '@pancakeswap/pools'
import { positionManagerAdapterABI, positionManagerWrapperABI } from '@pancakeswap/position-managers'
import { CAKE } from '@pancakeswap/tokens'
import { masterChefV3ABI } from '@pancakeswap/v3-sdk'
import { sidABI } from 'config/abi/SID'
import { SIDResolverABI } from 'config/abi/SIDResolver'
import { bCakeFarmBoosterABI } from 'config/abi/bCakeFarmBooster'
import { bCakeFarmBoosterProxyFactoryABI } from 'config/abi/bCakeFarmBoosterProxyFactory'
import { bCakeProxyABI } from 'config/abi/bCakeProxy'
import { chainlinkOracleABI } from 'config/abi/chainlinkOracle'
import { crossFarmingReceiverABI } from 'config/abi/crossFarmingReceiver'
import { crossFarmingSenderABI } from 'config/abi/crossFarmingSender'
import { fixedStakingABI } from 'config/abi/fixedStaking'
import { lpTokenABI } from 'config/abi/lpTokenAbi'
import { masterChefV2ABI } from 'config/abi/masterchefV2'
import { nonBscVaultABI } from 'config/abi/nonBscVault'
import { potteryVaultABI } from 'config/abi/potteryVaultAbi'
import { revenueSharingPoolGatewayABI } from 'config/abi/revenueSharingPoolGateway'
import { revenueSharingPoolProxyABI } from 'config/abi/revenueSharingPoolProxy'
import { stableSwapNativeHelperABI } from 'config/abi/stableSwapNativeHelper'
import { tradingRewardABI } from 'config/abi/tradingReward'
import { v3AirdropABI } from 'config/abi/v3Airdrop'
import { v3MigratorABI } from 'config/abi/v3Migrator'
import { vCakeABI } from 'config/abi/vCake'
import { veCakeABI } from 'config/abi/veCake'
import { viemClients } from 'utils/viem'
import { Abi, PublicClient, WalletClient, getContract as viemGetContract } from 'viem'
import { Address, erc20ABI, erc721ABI } from 'wagmi'

export const getContract = <TAbi extends Abi | unknown[], TWalletClient extends WalletClient>({
  abi,
  address,
  chainId = ChainId.KLAYTN,
  publicClient,
  signer,
}: {
  abi: TAbi
  address: Address
  chainId?: ChainId
  signer?: TWalletClient
  publicClient?: PublicClient
}) => {
  const c = viemGetContract({
    abi,
    address,
    // TODO: Fix viem
    // @ts-ignore
    publicClient: publicClient ?? viemClients[chainId],
    // TODO: Fix viem
    // @ts-ignore
    walletClient: signer,
  })
  return {
    ...c,
    account: signer?.account,
    chain: signer?.chain,
  }
}

export const getBep20Contract = (address: Address, signer?: WalletClient) => {
  return getContract({ abi: erc20ABI, address, signer })
}

export const getErc721Contract = (address: Address, walletClient?: WalletClient) => {
  return getContract({
    abi: erc721ABI,
    address,
    signer: walletClient,
  })
}
export const getLpContract = (address: Address, chainId?: number, signer?: WalletClient) => {
  return getContract({ abi: lpTokenABI, address, signer, chainId })
}

export const getCakeContract = (chainId?: number) => {
  return getContract({
    abi: erc20ABI,
    address: chainId ? CAKE[chainId]?.address : CAKE[ChainId.KLAYTN].address,
    chainId,
  })
}
export const getCakeVaultV2Contract = (signer?: WalletClient, chainId?: ChainId) => {
  return getContract({ abi: cakeVaultV2ABI, address: !chainId ? '0x' : getCakeVaultAddress(chainId), signer, chainId })
}

export const getCakeFlexibleSideVaultV2Contract = (signer?: WalletClient, chainId?: number) => {
  return getContract({
    abi: cakeFlexibleSideVaultV2ABI,
    address: getCakeFlexibleSideVaultAddress(chainId),
    signer,
    chainId,
  })
}

export const getPredictionsV3Contract = (address: Address, chainId?: number, signer?: WalletClient) => {
  return getContract({ abi: predictionsV3ABI, address, signer, chainId })
}

export const getPredictionsV2Contract = (address: Address, chainId?: number, signer?: WalletClient) => {
  return getContract({ abi: predictionsV2ABI, address, signer, chainId })
}

export const getChainlinkOracleContract = (address: Address, signer?: WalletClient, chainId?: number) => {
  return getContract({ abi: chainlinkOracleABI, address, signer, chainId })
}

export const getPotteryVaultContract = (address: Address, walletClient?: WalletClient) => {
  return getContract({ abi: potteryVaultABI, address, signer: walletClient })
}

export const getBCakeFarmBoosterContract = (signer?: WalletClient) => {
  return getContract({ abi: bCakeFarmBoosterABI, address: getBCakeFarmBoosterAddress(), signer })
}

export const getPositionManagerWrapperContract = (address: `0x${string}`, signer?: WalletClient, chainId?: number) => {
  return getContract({
    abi: positionManagerWrapperABI,
    address,
    signer,
    chainId,
  })
}

export const getPositionManagerAdapterContract = (address: `0x${string}`, signer?: WalletClient, chainId?: number) => {
  return getContract({
    abi: positionManagerAdapterABI,
    address,
    signer,
    chainId,
  })
}

export const getBCakeFarmBoosterProxyFactoryContract = (signer?: WalletClient) => {
  return getContract({
    abi: bCakeFarmBoosterProxyFactoryABI,
    address: getBCakeFarmBoosterProxyFactoryAddress(),
    signer,
  })
}

export const getBCakeProxyContract = (proxyContractAddress: Address, signer?: WalletClient) => {
  return getContract({ abi: bCakeProxyABI, address: proxyContractAddress, signer })
}

export const getNonBscVaultContract = (signer?: WalletClient, chainId?: number) => {
  return getContract({ abi: nonBscVaultABI, address: getNonBscVaultAddress(chainId), chainId, signer })
}

export const getSidContract = (address: Address, chainId: number) => {
  return getContract({ abi: sidABI, address, chainId })
}

export const getUnsContract = (address: Address, chainId?: ChainId, publicClient?: PublicClient) => {
  return getContract({
    abi: [
      {
        inputs: [
          {
            internalType: 'address',
            name: 'addr',
            type: 'address',
          },
        ],
        name: 'reverseNameOf',
        outputs: [
          {
            internalType: 'string',
            name: 'reverseUri',
            type: 'string',
          },
        ],
        stateMutability: 'view',
        type: 'function',
      },
    ] as const,
    chainId,
    address,
    publicClient,
  })
}

export const getSidResolverContract = (address: Address, signer?: WalletClient) => {
  return getContract({ abi: SIDResolverABI, address, signer })
}

export const getCrossFarmingSenderContract = (signer?: WalletClient, chainId?: number) => {
  return getContract({
    abi: crossFarmingSenderABI,
    address: getCrossFarmingSenderAddress(chainId),
    chainId,
    signer,
  })
}

export const getCrossFarmingReceiverContract = (signer?: WalletClient, chainId?: number) => {
  return getContract({
    abi: crossFarmingReceiverABI,
    address: getCrossFarmingReceiverAddress(chainId),
    chainId,
    signer,
  })
}
export const getCrossFarmingProxyContract = (
  proxyContractAddress: Address,
  signer?: WalletClient,
  chainId?: number,
) => {
  return getContract({ abi: crossFarmingProxyABI, address: proxyContractAddress, chainId, signer })
}

export const getStableSwapNativeHelperContract = (signer?: WalletClient, chainId?: number) => {
  return getContract({
    abi: stableSwapNativeHelperABI,
    address: getStableSwapNativeHelperAddress(chainId),
    chainId,
    signer,
  })
}

export const getMasterChefContract = (signer?: WalletClient, chainId?: number) => {
  return getContract({
    abi: masterChefV2ABI,
    address: getMasterChefV2Address(chainId),
    chainId,
    signer,
  })
}
export const getMasterChefV3Contract = (signer?: WalletClient, chainId?: number, isFinished?: boolean) => {
  const mcv3Address = isFinished ? getMasterChefV3FinishedAddress(chainId) : getMasterChefV3Address(chainId)
  return mcv3Address
    ? getContract({
        abi: masterChefV3ABI,
        address: mcv3Address,
        chainId,
        signer,
      })
    : null
}

export const getV3MigratorContract = (signer?: WalletClient, chainId?: number) => {
  return getContract({
    abi: v3MigratorABI,
    address: getV3MigratorAddress(chainId),
    chainId,
    signer,
  })
}

export const getTradingRewardContract = (signer?: WalletClient, chainId?: number) => {
  return getContract({
    abi: tradingRewardABI,
    address: getTradingRewardAddress(chainId),
    signer,
    chainId,
  })
}

export const getV3AirdropContract = (walletClient?: WalletClient) => {
  return getContract({
    abi: v3AirdropABI,
    address: getV3AirdropAddress(),
    signer: walletClient,
  })
}

export const getTradingRewardTopTradesContract = (signer?: WalletClient, chainId?: number) => {
  return getContract({
    abi: tradingRewardABI,
    address: getTradingRewardTopTradesAddress(chainId),
    signer,
    chainId,
  })
}

export const getVCakeContract = (signer?: WalletClient, chainId?: number) => {
  return getContract({
    abi: vCakeABI,
    address: getVCakeAddress(chainId),
    signer,
    chainId,
  })
}

export const getFixedStakingContract = (signer?: WalletClient, chainId?: number) => {
  return getContract({
    abi: fixedStakingABI,
    address: getFixedStakingAddress(chainId),
    signer,
    chainId,
  })
}

export const getVeCakeContract = (signer?: WalletClient, chainId?: number) => {
  return getContract({
    abi: veCakeABI,
    address: getVeCakeAddress(chainId) ?? getVeCakeAddress(ChainId.KLAYTN),
    signer,
    chainId,
  })
}

export const getRevenueSharingCakePoolContract = (signer?: WalletClient, chainId?: number) => {
  return getContract({
    abi: revenueSharingPoolProxyABI,
    address: getRevenueSharingCakePoolAddress(chainId) ?? getRevenueSharingCakePoolAddress(ChainId.KLAYTN),
    signer,
    chainId,
  })
}

export const getRevenueSharingVeCakeContract = (signer?: WalletClient, chainId?: number) => {
  return getContract({
    abi: revenueSharingPoolProxyABI,
    address: getRevenueSharingVeCakeAddress(chainId) ?? getRevenueSharingVeCakeAddress(ChainId.KLAYTN),
    signer,
    chainId,
  })
}

export const getRevenueSharingPoolGatewayContract = (signer?: WalletClient, chainId?: number) => {
  return getContract({
    abi: revenueSharingPoolGatewayABI,
    address: getRevenueSharingPoolGatewayAddress(chainId) ?? getRevenueSharingPoolGatewayAddress(ChainId.KLAYTN),
    signer,
    chainId,
  })
}
