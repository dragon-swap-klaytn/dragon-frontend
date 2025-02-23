import { PoolType } from 'types'
import { TokenV2Chart } from 'views/Dashboard/components/TokenChart/v2'
import { TokenV3Chart } from 'views/Dashboard/components/TokenChart/v3'

type TokenChartProps = {
  poolType: PoolType
  address: string
}

export function TokenChart({ poolType, address }: TokenChartProps) {
  switch (poolType) {
    case 'v2':
      return <TokenV2Chart address={address} />
    case 'v3':
      return <TokenV3Chart address={address} />
    default:
      return null
  }
}
