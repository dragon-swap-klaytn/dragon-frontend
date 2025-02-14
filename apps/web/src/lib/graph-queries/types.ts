import { Address } from 'viem'
import { TransactionType } from 'views/Dashboard/types'

type TokenSimple = {
  id: Address
  symbol: string
  name: string
  decimals: number
}

type PoolBase = {
  id: Address
  token0: TokenSimple
  token1: TokenSimple
  reserve0: number
  reserve1: number
  tvlUSD: number
}

type PoolAccDataBase = {
  id: Address
  volumeUSD: number
  txCount: number
}

export type PoolV2Base = PoolBase & {
  // name: string
  // totalSupply: number
}

export type PoolV2AccData = PoolAccDataBase

export type PoolV2Raw = PoolV2Base & PoolV2AccData

export type PoolV3Base = PoolBase & {
  feeTier: string
  feeProtocol: string
}

export type PoolV3AccData = PoolAccDataBase & {
  // volumeToken0: number
  // volumeToken1: number
  // collectedFeesToken0: number
  // collectedFeesToken1: number
  feeUSD: number
  protocolFeeUSD: number
  liquidityProviderCount: number
}

export type PoolV3Raw = PoolV3Base & PoolV3AccData

export type TokenBase = TokenSimple & {
  tvl: number
  tvlUSD: number
}

export type TokenAccData = {
  id: Address
  priceUSD: number
  volume: number
  volumeUSD: number
  txCount: number
}

export type TokenRaw = TokenBase & TokenAccData

export type DayDataV2 = {
  timestamp: number
  volumeUSD: number
  tvlUSD: number
  txCount: number
}

export type PancakeDayDataV2 = DayDataV2
export type PoolDayDataV2 = DayDataV2

export type DayDataV3 = {
  timestamp: number
  volumeUSD: number
  tvlUSD: number
  txCount: number
  feeUSD: number
  protocolFeeUSD: number
}

export type PancakeDayDataV3 = DayDataV3
export type PoolDayDataV3 = DayDataV3

export type TransactionEvent = {
  timestamp: number
  txHash: string
  pool: string
  token0: TokenSimple
  token1: TokenSimple
  account: string
  amount0: number
  amount1: number
  amountUSD: number
}

export type TransactionEventWithType = {
  type: TransactionType
} & TransactionEvent
