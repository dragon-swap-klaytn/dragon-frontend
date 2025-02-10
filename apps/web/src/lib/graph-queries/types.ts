type PoolBase = {
  id: string
  token0: string
  token1: string
  reserve0: number
  reserve1: number
  tvlUSD: number
}

type PoolAccDataBase = {
  id: string
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

export type TokenBase = {
  id: string
  symbol: string
  name: string
  decimals: number

  tvl: number
  tvlUSD: number
}

export type TokenAccData = {
  id: string
  priceUSD: number
  volume: number
  volumeUSD: number
  txCount: number
}

export type TokenRaw = TokenBase & TokenAccData
