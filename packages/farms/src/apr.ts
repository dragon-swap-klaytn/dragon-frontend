import { BigintIsh, ZERO } from '@pancakeswap/sdk'
import { formatFraction, parseNumberToFraction } from '@pancakeswap/utils/formatFractions'
import BN from 'bignumber.js'

type BigNumberish = BN | number | string

interface FarmAprParams {
  poolWeight: BigNumberish
  // Total tvl staked in farm in usd
  tvlUsd: BigNumberish
  cakePriceUsd: BigNumberish
  cakePerSecond: BigNumberish

  precision?: number

  excludePositionLiquidity?: boolean
}

const SECONDS_FOR_YEAR = 365 * 60 * 60 * 24

const isValid = (num: BigNumberish) => {
  const bigNumber = new BN(num)
  return bigNumber.isFinite() && bigNumber.isPositive()
}

const formatNumber = (bn: BN, precision: number) => {
  return formatFraction(parseNumberToFraction(bn.toNumber(), precision), precision)
}

export function getFarmApr({ poolWeight, tvlUsd, cakePriceUsd, cakePerSecond, precision = 6 }: FarmAprParams) {
  if (!isValid(poolWeight) || !isValid(tvlUsd) || !isValid(cakePriceUsd) || !isValid(cakePerSecond)) {
    return '0'
  }

  const cakeRewardPerYear = new BN(cakePerSecond).times(SECONDS_FOR_YEAR)
  const farmApr = new BN(poolWeight).times(cakeRewardPerYear).times(cakePriceUsd).div(tvlUsd).times(100)

  if (farmApr.isZero()) {
    return '0'
  }

  return formatNumber(farmApr, precision)
}

export interface PositionFarmAprParams extends Omit<FarmAprParams, 'tvlUsd'> {
  // Position liquidity
  liquidity: BigintIsh

  // Total staked liquidity in farm
  totalStakedLiquidity: BigintIsh

  // Position tvl in usd
  positionTvlUsd: BigNumberish
}

export function getPositionFarmApr({
  poolWeight,
  positionTvlUsd,
  cakePriceUsd,
  cakePerSecond,
  liquidity,
  totalStakedLiquidity,
  precision = 6,
  excludePositionLiquidity = false,
}: PositionFarmAprParams) {
  const aprFactor = getPositionFarmAprFactor({
    poolWeight,
    cakePriceUsd,
    cakePerSecond,
    liquidity,
    totalStakedLiquidity,
    excludePositionLiquidity,
  })
  if (!isValid(aprFactor) || !isValid(positionTvlUsd)) {
    return '0'
  }

  const positionApr = aprFactor.times(liquidity.toString()).div(positionTvlUsd)

  return formatNumber(positionApr, precision)
}

export function getPositionFarmAprFactor({
  poolWeight,
  cakePriceUsd,
  cakePerSecond,
  liquidity,
  totalStakedLiquidity,
  excludePositionLiquidity = false,
}: Omit<PositionFarmAprParams, 'positionTvlUsd' | 'precision'>) {
  if (
    !isValid(poolWeight) ||
    !isValid(cakePriceUsd) ||
    !isValid(cakePerSecond) ||
    (!excludePositionLiquidity && BigInt(liquidity) === ZERO) ||
    BigInt(totalStakedLiquidity) === ZERO
  ) {
    return new BN(0)
  }

  const cakeRewardPerYear = new BN(cakePerSecond).times(SECONDS_FOR_YEAR)
  const aprFactor = new BN(poolWeight)
    .times(cakeRewardPerYear)
    .times(cakePriceUsd)
    .div(((excludePositionLiquidity ? ZERO : BigInt(liquidity)) + BigInt(totalStakedLiquidity)).toString())
    .times(100)

  return aprFactor
}
