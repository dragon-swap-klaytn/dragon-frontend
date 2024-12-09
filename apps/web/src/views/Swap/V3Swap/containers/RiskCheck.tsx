import { Currency } from '@pancakeswap/sdk'
import { Box } from '@pancakeswap/uikit'
import { memo } from 'react'

import AccessRisk from 'components/AccessRisk'

interface Props {
  currency?: Currency
}

export const RiskCheck = memo(function RiskCheck({ currency }: Props) {
  // const { isAccessTokenSupported } = useContext(SwapFeaturesContext)

  // if (!isAccessTokenSupported || !currency?.isToken) {
  if (!currency?.isToken) {
    return null
  }

  return (
    <Box>
      <AccessRisk token={currency} />
    </Box>
  )
})
