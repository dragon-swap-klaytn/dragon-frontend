import { PCSDuoTokenVaultConfig, VaultConfig } from '../../types'
import { MANAGER } from '../managers'
import { SupportedChainId } from '../supportedChains'

export type VaultsConfigByChain = {
  [chainId in SupportedChainId]: VaultConfig[]
}

export const VAULTS_CONFIG_BY_CHAIN = {}

export function isPCSVaultConfig(config: VaultConfig): config is PCSDuoTokenVaultConfig {
  return config.manager === MANAGER.PCS
}

export function isThirdPartyVaultConfig(config: VaultConfig): config is PCSDuoTokenVaultConfig {
  return config.manager !== MANAGER.PCS
}
