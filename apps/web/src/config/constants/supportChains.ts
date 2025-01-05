import { supportedChainId } from '@pancakeswap/farms'

export const SUPPORT_FARMS = process.env.NEXT_PUBLIC_DISABLE_FARM === '1' ? [] : supportedChainId
export const V3_MIGRATION_SUPPORTED_CHAINS = [] as number[]
