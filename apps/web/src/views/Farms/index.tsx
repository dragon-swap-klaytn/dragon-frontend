import Router from 'next/router'
import { useEffect } from 'react'
import { styled, useTheme } from 'styled-components'
import { useAccount, useNetwork } from 'wagmi'
import { mainnet } from 'wagmi/chains'
import { FarmsContext, FarmsV3Context } from './context'
import FarmsV3 from './FarmsV3'

export function useIsBloctoETH() {
  const { chain } = useNetwork()
  const { isConnected, connector } = useAccount()
  const isETH = chain?.id === mainnet.id
  // return (
  //   (connector?.id === ConnectorNames.Blocto ||
  //     (typeof window !== 'undefined' && Boolean((window.ethereum as ExtendEthereum)?.isBlocto))) &&
  //   isConnected &&
  //   isETH
  // )
  return false
}

type FarmsV3PageLayoutDivProps = { isDark: boolean }
const FarmsV3PageLayoutDiv = styled.div<FarmsV3PageLayoutDivProps>`
  background-color: ${({ isDark }) => (isDark ? '#172734' : 'transparent')};
`

export const FarmsV3PageLayout: React.FC<React.PropsWithChildren<unknown>> = ({ children }) => {
  const { isDark } = useTheme()

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_DISABLE_FARM === '1') {
      Router.replace('/liquidity').finally(() => {})
    }
  }, [])

  return (
    <FarmsV3PageLayoutDiv isDark={isDark}>
      <FarmsV3>{children}</FarmsV3>
    </FarmsV3PageLayoutDiv>
  )
}

export { FarmsContext, FarmsV3Context }
