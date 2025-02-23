import { ERC20Token, Token } from '@pancakeswap/sdk'
import { klaytnTokens } from '@pancakeswap/tokens'
import slice from 'lodash/slice'
import { publicClient } from 'utils/client'
import { describe, it } from 'vitest'
import { erc20ABI } from 'wagmi'

const whitelist = ['deprecated_tusd', 'deprecated_rpg', 'deprecated_mix']

const tokenListsToTest: [Record<string, ERC20Token>] = [klaytnTokens]

const tokenTables: [string, ERC20Token][] = tokenListsToTest.reduce(
  (acc, cur) => [...acc, ...Object.entries(cur)],
  [] as [string, ERC20Token][],
)

describe.concurrent(
  'Config tokens',
  () => {
    it.each(slice(tokenTables, tokenTables.length - 50))(
      'Token %s has the correct key, symbol, and decimal',
      async (key: string, token: Token) => {
        const client = publicClient({ chainId: token.chainId })
        const [symbol, decimals] = await client.multicall({
          contracts: [
            {
              abi: erc20ABI,
              address: token.address,
              functionName: 'symbol',
            },
            {
              abi: erc20ABI,
              address: token.address,
              functionName: 'decimals',
            },
          ],
          allowFailure: false,
        })

        const isWhitelisted = whitelist.includes(key.toLowerCase())
        if (!isWhitelisted) expect(key.toLowerCase()).toBe(token.symbol.toLowerCase())
        if (!isWhitelisted) expect(token.symbol.toLocaleLowerCase()).toBe(symbol.toLocaleLowerCase())
        expect(token.decimals).toBe(decimals)
      },
    )
  },
  {
    timeout: 50_000,
  },
)
