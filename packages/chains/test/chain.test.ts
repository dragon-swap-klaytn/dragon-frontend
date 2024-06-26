import { describe, expect, it } from 'vitest'
import { ChainId, isTestnetChainId } from '../src'

describe('chains', () => {
  it('should be defined', () => {
    expect(ChainId).toBeDefined()
  })

  it('should return if chainId is testnet or not ', () => {
    expect(isTestnetChainId(ChainId.KLAYTN_TESTNET)).toBeTruthy()
    expect(isTestnetChainId(ChainId.KLAYTN)).toBeFalsy()
  })
})
