import { DEFAULT_LANGUAGE } from '@pancakeswap/localization'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import RemoveLiquidityFormProvider from 'views/RemoveLiquidity/form/RemoveLiquidityFormProvider'
import RemoveLiquidity from 'views/RemoveLiquidity/RemoveLiquidityV3'

const RemoveLiquidityPage = () => {
  return (
    <RemoveLiquidityFormProvider>
      <RemoveLiquidity />
    </RemoveLiquidityFormProvider>
  )
}

export default RemoveLiquidityPage

export const getStaticPaths = ({ locales }) => {
  return {
    // any tokenId for server-side rendering
    paths: locales?.map((locale) => ({ params: { tokenId: '1', locale } })) || [],
    fallback: 'blocking',
  }
}
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
