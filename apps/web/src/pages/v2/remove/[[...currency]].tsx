import { DEFAULT_LANGUAGE } from '@pancakeswap/localization'
import { useCurrency } from 'hooks/Tokens'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useRouter } from 'next/router'
import { defaultStaticPaths } from 'utils/pageUtils'
import RemoveLiquidity, { RemoveLiquidityV2Layout } from 'views/RemoveLiquidity'
import RemoveLiquidityV2FormProvider from 'views/RemoveLiquidity/RemoveLiquidityV2FormProvider'
import RemoveStableLiquidity, { RemoveLiquidityStableLayout } from 'views/RemoveLiquidity/RemoveStableLiquidity'
import useStableConfig, { StableConfigContext } from 'views/Swap/hooks/useStableConfig'

const RemoveLiquidityPage = () => {
  const router = useRouter()

  const [currencyIdA, currencyIdB] = router.query.currency || []

  const [currencyA, currencyB] = [useCurrency(currencyIdA) ?? undefined, useCurrency(currencyIdB) ?? undefined]

  const stableConfig = useStableConfig({
    tokenA: currencyA,
    tokenB: currencyB,
  })

  const props = {
    currencyIdA,
    currencyIdB,
    currencyA,
    currencyB,
  }

  return stableConfig.stableSwapConfig && Boolean(router.query.stable) ? (
    <RemoveLiquidityV2FormProvider>
      <StableConfigContext.Provider value={stableConfig}>
        <RemoveLiquidityStableLayout {...props}>
          <RemoveStableLiquidity {...props} />
        </RemoveLiquidityStableLayout>
      </StableConfigContext.Provider>
    </RemoveLiquidityV2FormProvider>
  ) : (
    <RemoveLiquidityV2FormProvider>
      <RemoveLiquidityV2Layout {...props}>
        <RemoveLiquidity {...props} />
      </RemoveLiquidityV2Layout>
    </RemoveLiquidityV2FormProvider>
  )
}

export default RemoveLiquidityPage

const OLD_PATH_STRUCTURE = /^(0x[a-fA-F0-9]{40})-(0x[a-fA-F0-9]{40})$/

export const getStaticPaths = defaultStaticPaths
export const getStaticProps = async ({ params, locale }: { params: any; locale: string }) => {
  const currency = (params?.currency as string[]) || []

  if (currency.length === 0) {
    return {
      notFound: true,
    }
  }

  if (currency.length === 1) {
    if (!OLD_PATH_STRUCTURE.test(currency[0])) {
      return {
        redirect: {
          statusCode: 307,
          destination: `/pool`,
        },
      }
    }

    const split = currency[0].split('-')
    if (split.length > 1) {
      const [currency0, currency1] = split
      return {
        redirect: {
          statusCode: 307,
          destination: `/v2/remove/${currency0}/${currency1}`,
        },
      }
    }
  }

  return {
    props: {
      ...(await serverSideTranslations(locale || DEFAULT_LANGUAGE, ['common'])),
    },
  }
}
