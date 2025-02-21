import { DEFAULT_LANGUAGE } from '@pancakeswap/localization'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { getDefaultStaticPaths } from 'utils/pageUtils'
import { CHAIN_IDS } from 'utils/wagmi'
import RemoveLiquidityFormProvider from 'views/RemoveLiquidity/form/RemoveLiquidityFormProvider'
import RemoveLiquidity from 'views/RemoveLiquidity/RemoveLiquidityV3'

const RemoveLiquidityPage = () => {
  return (
    <RemoveLiquidityFormProvider>
      <RemoveLiquidity />
    </RemoveLiquidityFormProvider>
  )
}

RemoveLiquidityPage.chains = CHAIN_IDS

export default RemoveLiquidityPage

export const getStaticPaths = getDefaultStaticPaths
export const getStaticProps = async ({ params, locale }: { params: any; locale: string }) => {
  const { tokenId } = params || {}

  const isNumberReg = /^\d+$/

  if (!(tokenId as string)?.match(isNumberReg)) {
    return {
      redirect: {
        statusCode: 303,
        destination: `/add`,
      },
    }
  }

  return {
    props: {
      ...(await serverSideTranslations(locale || DEFAULT_LANGUAGE, ['common'])),
    },
  }
}
