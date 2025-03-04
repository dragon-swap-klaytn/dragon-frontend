import { Locale } from '@pancakeswap/localization'
import { GetStaticPaths } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { isAddress } from 'viem'

export const getDefaultStaticProps = (locales: string[]) => {
  return async ({ locale, defaultLocale }: { locale: Locale; defaultLocale: Locale }) => {
    return {
      props: {
        ...(await serverSideTranslations(locale || defaultLocale, locales)),
      },
    }
  }
}

export const defaultStaticPaths: GetStaticPaths = () => {
  return {
    paths: [],
    fallback: 'blocking',
  }
}

export const getTokenStaticProps = async ({
  params,
  locale,
  defaultLocale,
}: {
  params: any
  locale: Locale
  defaultLocale: Locale
}) => {
  const { poolType } = params || {}

  if (poolType !== 'v2' && poolType !== 'v3') {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    }
  }

  const address = params?.address

  // In case somebody pastes checksummed address into url (since GraphQL expects lowercase address)
  if (!address || !isAddress(String(address).toLowerCase())) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    }
  }

  return {
    props: {
      poolType,
      address,
      ...(await serverSideTranslations(locale || defaultLocale, ['common'])),
    },
  }
}
