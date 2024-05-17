import { ChainId } from '@pancakeswap/chains'
import { FeeAmount } from '@pancakeswap/v3-sdk'
import type { ReactNode } from 'react'
import { styled } from 'styled-components'
import { CHAIN_IDS } from 'utils/wagmi'

export const FEE_AMOUNT_DETAIL: Record<
  FeeAmount,
  { label: string; description: ReactNode; supportedChains: ChainId[] }
> = {
  [FeeAmount.LOWEST]: {
    label: '0.01',
    description: 'Best for very stable pairs.',
    supportedChains: CHAIN_IDS,
  },
  [FeeAmount.LOW]: {
    label: '0.05',
    description: 'Best for stable pairs.',
    supportedChains: CHAIN_IDS,
  },
  [FeeAmount.MEDIUMLOW]: {
    label: '0.1',
    description: 'Best for most pairs.',
    supportedChains: CHAIN_IDS,
  },
  [FeeAmount.MEDIUM]: {
    label: '0.2',
    description: 'Best for most pairs.',
    supportedChains: CHAIN_IDS,
  },
  [FeeAmount.HIGH]: {
    label: '0.5',
    description: 'Best for exotic pairs.',
    supportedChains: CHAIN_IDS,
  },
  [FeeAmount.HIGHEST]: {
    label: '1',
    description: 'Best for more exotic pairs.',
    supportedChains: CHAIN_IDS,
  },
}
export const SelectContainer = styled.div`
  align-items: flex-start;
  display: grid;
  grid-auto-flow: column;
  grid-gap: 4px;
  max-width: 282px;
  overflow-x: auto;
  ${({ theme }) => theme.mediaQueries.lg} {
    max-width: 370px;
  }
`
