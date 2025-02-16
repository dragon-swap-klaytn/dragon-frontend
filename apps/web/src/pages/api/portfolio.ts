import { VALID_ADDRESS_REGEX } from '@pancakeswap/uikit'
import { NextApiHandler } from 'next'

import { Simplify } from 'type-fest'
import { PoolType } from 'types'
import { Address } from 'viem'
import { z } from 'zod'

const SS_PORTFOLIO_API = 'https://api.swapscanner.io/api/v0/dg-swap/portfolio'

type PortfolioTokenBaseData = {
  address: Address
  amount: number
}

type PortfolioTokenV3Data = PortfolioTokenBaseData & {
  feeAmount: number
}

type PortfolioBaseData = {
  poolId: Address
  type: PoolType
}

export type PortfolioPosition = {
  positionId: number
  token0: PortfolioTokenV3Data
  token1: PortfolioTokenV3Data
  isStaked: boolean
  isOutOfBounds: boolean
  rewards?: PortfolioTokenBaseData[]
  liquidity: number
  lower: number
  upper: number
  sqrtPriceX96: string
}

export type PortfolioV3Data = Simplify<
  PortfolioBaseData & {
    positions: PortfolioPosition[]
  }
>

export type PortfolioV2Data = Simplify<
  PortfolioBaseData & {
    token0: PortfolioTokenBaseData
    token1: PortfolioTokenBaseData
  }
>

const poolsSchema = z.object({
  account: z.string().regex(VALID_ADDRESS_REGEX),
  poolTypes: z.preprocess(
    (v) => (typeof v === 'string' && v.length > 0 ? v.split(',') : ['v2', 'v3']),
    z.enum(['v2', 'v3']).array().nonempty(),
  ),
  onlyPoolIds: z.preprocess(
    (v) => (typeof v === 'string' && v.length > 0 ? v.split(',') : []),
    z.string().regex(VALID_ADDRESS_REGEX).array(),
  ),
})

type FetchedPortfolioTokenData = {
  address: Address
  amount: number
}
type FetchedPortfolioBaseData = {
  type: 'position' | 'farm' | 'pair'
  pool: Address
  tokens: FetchedPortfolioTokenData[]
}

type FetchedPortfolioV3Data = Simplify<
  FetchedPortfolioBaseData & {
    positionId: number
    token0: Address
    token1: Address
    fee: number
    liquidity: number
    lower: number
    upper: number
    pool: Address
    sqrtPriceX96: string
    outOfBounds: boolean
    fees: FetchedPortfolioTokenData[]
    rewards: FetchedPortfolioTokenData[]
  }
>

type FetchedPortfolioV2Data = FetchedPortfolioBaseData

const fetchPortfolioFromSs = async (account: Address) => {
  try {
    const res = await fetch(`${SS_PORTFOLIO_API}?account=${account}`)
    const parsed = (await res.json()) as { portfolio: (FetchedPortfolioV3Data | FetchedPortfolioV2Data)[] }

    return parsed.portfolio
  } catch (e) {
    console.error('[fetchPortfolioFromSs]: Error fetching portfolio', e)
    return []
  }
}

const handler: NextApiHandler = async (req, res) => {
  const { account, poolTypes, onlyPoolIds } = await poolsSchema.parseAsync(req.query)

  const portfolio = await fetchPortfolioFromSs(account as Address)

  const portfolioMap = portfolio.reduce((acc, staking) => {
    const { pool, type, tokens } = staking
    const poolId = pool.toLowerCase() as Address
    const poolType = ['position', 'farm'].includes(type) ? 'v3' : 'v2'

    if (!poolTypes.includes(poolType)) {
      return acc
    }

    if (onlyPoolIds.length > 0 && !onlyPoolIds.includes(poolId)) {
      return acc
    }

    if (poolType === 'v3') {
      const { positionId, rewards, outOfBounds, fees, liquidity, lower, upper, sqrtPriceX96 } =
        staking as FetchedPortfolioV3Data

      const prevPositions = (acc[poolId] as PortfolioV3Data)?.positions ?? []
      const newPosition: PortfolioPosition = {
        positionId,
        token0: {
          address: tokens[0].address,
          amount: tokens[0].amount,
          feeAmount: fees?.find((fee) => fee.address === tokens[0].address)?.amount ?? 0,
        },
        token1: {
          address: tokens[1].address,
          amount: tokens[1].amount,
          feeAmount: fees?.find((fee) => fee.address === tokens[1].address)?.amount ?? 0,
        },
        ...(rewards ? { rewards } : {}),
        isStaked: type === 'farm',
        isOutOfBounds: outOfBounds,
        liquidity,
        lower,
        upper,
        sqrtPriceX96,
      }

      return {
        ...acc,
        [poolId]: {
          ...acc[poolId],
          poolId,
          type: poolType,
          positions: [...prevPositions, newPosition],
        } as PortfolioV3Data,
      }
    }

    return {
      ...acc,
      [poolId]: {
        ...acc[poolId],
        poolId,
        type: poolType,
        token0: {
          address: tokens[0].address,
          amount: tokens[0].amount,
        },
        token1: {
          address: tokens[1].address,
          amount: tokens[1].amount,
        },
      } as PortfolioV2Data,
    }
  }, {} as { [poolId: Address]: PortfolioV3Data | PortfolioV2Data })

  res.status(200).json(portfolioMap)
}

export default handler
