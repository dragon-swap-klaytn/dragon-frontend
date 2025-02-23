import { useTranslation } from '@pancakeswap/localization'
import { ButtonV2 } from '@pancakeswap/uikit'
import { useBackTo } from 'hooks/use-back-to'
import { TokenSimple } from 'lib/graph-queries/types'
import NextLink from 'next/link'
import { PoolType } from 'types'
import { unwrapWKAIAAdress } from 'utils/unwrap-wkaia-address'

export function AddLiquidityButtonV2({
  poolType = 'v3',
  token0,
  token1,
  fullWidth = false,
}: {
  poolType?: PoolType
  token0?: TokenSimple
  token1?: TokenSimple
  fullWidth?: boolean
}) {
  const { t } = useTranslation()

  const { saveBackToHref } = useBackTo()

  return (
    <NextLink
      className="w-full"
      href={`${poolType === 'v2' ? '/v2/add' : '/add'}${token0 ? `/${unwrapWKAIAAdress(token0.id)}` : ''}${
        token1 ? `/${unwrapWKAIAAdress(token1.id)}` : ''
      }`}
    >
      <ButtonV2
        variant="secondary"
        fullWidth={fullWidth}
        onClick={() => {
          saveBackToHref()
        }}
      >
        {t('Add Liquidity')}
      </ButtonV2>
    </NextLink>
  )
}
