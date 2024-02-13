import {ChainId} from '@pancakeswap/chains'
import {bsc, klaytn} from 'wagmi/chains'

export const SUPPORTED_CHAIN_IDS = [ChainId.BSC, ChainId.KLAYTN] as const

export type SupportedChainId = (typeof SUPPORTED_CHAIN_IDS)[number]

export const targetChains = [bsc, klaytn]
