import { ComputedFarmConfigV3 } from '@pancakeswap/farms'

export interface V3ProtocolData {
  // volume
  volumeUSD: number
  volumeUSDChange: number

  // in range liquidity
  tvlUSD: number
  tvlUSDChange: number

  // fees
  feesUSD: number
  feeChange: number

  // transactions
  txCount: number
  txCountChange: number
}
export interface ChartDayData {
  date: number
  volumeUSD: number
  tvlUSD: number
}

export enum VolumeWindow {
  daily,
  weekly,
  monthly,
}

export enum TransactionType {
  SWAP,
  MINT,
  BURN,
}

export type Transaction = {
  type: TransactionType
  hash: string
  timestamp: string
  sender: string
  token0Symbol: string
  token1Symbol: string
  token0Address: string
  token1Address: string
  amountUSD: number
  amountToken0: number
  amountToken1: number
}

export type PriceChartEntry = {
  time: number // unix timestamp
  open: number
  close: number
  high: number
  low: number
}

export type V3TokenData = {
  // token is in some pool on uniswap
  exists: boolean

  // basic token info
  name: string
  symbol: string
  address: string
  decimals: number

  // volume
  volumeUSD: number
  volumeUSDChange: number
  volumeUSDWeek: number
  txCount: number

  // fees
  feesUSD: number

  // tvl
  tvlToken: number
  tvlUSD: number
  tvlUSDChange: number

  priceUSD: number
  priceUSDChange: number
  priceUSDChangeWeek: number
}

export interface V3TokenChartEntry {
  date: number
  volumeUSD: number
  totalValueLockedUSD: number
}

export type V3PoolChartEntry = {
  date: number
  volumeUSD: number
  totalValueLockedUSD: number
  feesUSD: number
}

export interface V3PoolData {
  // basic token info
  address: string
  feeTier: number

  token0: {
    name: string
    symbol: string
    address: string
    decimals: number
    derivedETH: number
  }

  token1: {
    name: string
    symbol: string
    address: string
    decimals: number
    derivedETH: number
  }

  // for tick math
  liquidity: number
  sqrtPrice: number
  tick: number

  // volume
  volumeUSD: number
  volumeUSDChange: number
  volumeUSDWeek: number

  // liquidity
  tvlUSD: number
  tvlUSDChange: number

  // prices
  token0Price: number
  token1Price: number

  // token amounts
  tvlToken0: number
  tvlToken1: number

  // 24h fees
  feeUSD: number
}

export interface GenericChartEntry {
  time: string
  value: number
}

export interface DensityChartEntry {
  index: number
  isCurrent: boolean
  activeLiquidity: number
  price0: number
  price1: number
  tvlToken0: number
  tvlToken1: number
}

export interface Block {
  number: number
  timestamp: string
}

export interface V2TokenChartEntry {
  date: number
  volumeUSD: number
  liquidityUSD: number
}

export interface V2ProtocolData {
  volumeUSD: number
  volumeUSDChange: number // in 24h, as percentage

  liquidityUSD: number
  liquidityUSDChange: number // in 24h, as percentage

  txCount: number
  txCountChange: number
}

export interface ProtocolState {
  readonly overview?: V2ProtocolData
  readonly chartData?: V2TokenChartEntry[]
  readonly transactions?: Transaction[]
}

export interface V2PoolData {
  address: string
  timestamp: number

  token0: {
    name: string
    symbol: string
    address: string
  }

  token1: {
    name: string
    symbol: string
    address: string
  }

  volumeUSD: number
  volumeOutUSD?: number
  volumeUSDChange: number
  volumeUSDWeek: number
  volumeOutUSDWeek?: number
  volumeUSDChangeWeek: number

  totalFees24h: number
  totalFees7d: number
  lpFees24h: number
  lpFees7d: number
  lpApr7d: number

  liquidityUSD: number
  liquidityUSDChange: number

  token0Price: number
  token1Price: number

  liquidityToken0: number
  liquidityToken1: number
}

export interface PoolsState {
  byAddress: {
    [address: string]: {
      data?: V2PoolData
      chartData?: V2TokenChartEntry[]
      transactions?: Transaction[]
    }
  }
}

// TOKENS

export type V2TokenData = {
  exists: boolean

  name: string
  symbol: string
  address: string
  decimals: number

  volumeUSD: number
  volumeUSDChange: number
  volumeUSDWeek: number
  txCount: number

  liquidityToken: number
  liquidityUSD: number
  liquidityUSDChange: number

  priceUSD: number
  priceUSDChange: number
  priceUSDChangeWeek: number

  campaignId?: string
  pairs?: ComputedFarmConfigV3[]
}

export interface TokensState {
  byAddress: {
    [address: string]: {
      data?: V2TokenData
      poolAddresses?: string[]
      chartData?: V2TokenChartEntry[]
      priceData: {
        oldestFetchedTimestamp?: number
        [secondsInterval: number]: PriceChartEntry[] | undefined
      }
      transactions?: Transaction[]
    }
  }
}

// Info redux state
export interface InfoState {
  protocol: ProtocolState
  pools: PoolsState
  tokens: TokensState
}

export enum InfoDataSource {
  V3,
  V2,
}

// helpers
interface PairResponse {
  token0: {
    id: string
    symbol: string
  }
  token1: {
    id: string
    symbol: string
  }
}

export interface MintResponse {
  id: string
  timestamp: string
  pair?: PairResponse
  to: string
  amount0: string
  amount1: string
  amountUSD: string
}

export interface SwapResponse {
  id: string
  timestamp: string
  pair?: PairResponse
  from: string
  amount0In: string
  amount1In: string
  amount0Out: string
  amount1Out: string
  amountUSD: string
}

export interface BurnResponse {
  id: string
  timestamp: string
  pair?: PairResponse
  sender: string
  amount0: string
  amount1: string
  amountUSD: string
}
export interface TokenDayData {
  date: number // UNIX timestamp in seconds
  dailyVolumeUSD: string
  totalLiquidityUSD: string
}

export interface TokenDayDatasResponse {
  tokenDayDatas: TokenDayData[]
}

// Footprint is the same, declared just for better readability
export type PancakeDayData = TokenDayData

export interface PancakeDayDatasResponse {
  pancakeDayDatas: PancakeDayData[]
}

export interface PairDayData {
  date: number // UNIX timestamp in seconds
  dailyVolumeUSD: string
  reserveUSD: string
}

export interface PairDayDatasResponse {
  pairDayDatas: PairDayData[]
}

export type SortDirection = 'asc' | 'desc'
