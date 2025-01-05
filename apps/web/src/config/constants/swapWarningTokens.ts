import { ChainId } from '@pancakeswap/chains'
import { Token } from '@pancakeswap/sdk'
import { kaiaWarningTokens } from 'config/constants/warningTokens'

interface WarningTokenList {
  [chainId: number]: {
    [key: string]: Token
  }
}

// DEV_NOTE : swap warning token 설정
const SwapWarningTokens = <WarningTokenList>{
  [ChainId.KLAYTN]: {
    ...kaiaWarningTokens,
  },
}

export default SwapWarningTokens
