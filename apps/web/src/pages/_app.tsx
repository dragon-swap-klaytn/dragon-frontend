import { ScrollToTopButtonV2, ToastListener } from '@pancakeswap/uikit'
import BigNumber from 'bignumber.js'
import { ErrorBoundary } from 'components/ErrorBoundary'
import { NetworkModal } from 'components/NetworkModal'
import { useAccountEventListener } from 'hooks/useAccountEventListener'
import NextApp from 'next/app'
// import useEagerConnectMP from 'hooks/useEagerConnect.bmp'
import useLockedEndNotification from 'hooks/useLockedEndNotification'
import useSentryUser from 'hooks/useSentryUser'
import useThemeCookie from 'hooks/useThemeCookie'
import useUserAgent from 'hooks/useUserAgent'
import { NextPage } from 'next'
import { DefaultSeo } from 'next-seo'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import Script from 'next/script'
import { Fragment } from 'react'

// import { useDataDogRUM } from 'hooks/useDataDogRUM'
import { ChainId } from '@pancakeswap/chains'
import { appWithTranslation } from '@pancakeswap/localization'
import Footer from 'components/Menu/Footer'
import Oops from 'components/Oops'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import useEagerConnect from 'hooks/useEagerConnect'
import { useLoadExperimentalFeatures } from 'hooks/useExperimentalFeatureEnabled'
import { useRouter } from 'next/router'
import { useStore } from 'state'
import { usePollBlockNumber } from 'state/block/hooks'
import { Blocklist, Updaters } from '..'
import nextI18NextConfig from '../../next-i18next.config.js'
import { defaultSeoEN, defaultSeoKO } from '../../next-seo.config'
import Providers from '../Providers'
import Menu from '../components/Menu'
import '../style/global.css'

// This config is required for number formatting
BigNumber.config({
  EXPONENTIAL_AT: 1000,
  DECIMAL_PLACES: 80,
})

function GlobalHooks() {
  // useDataDogRUM()
  useLoadExperimentalFeatures()
  usePollBlockNumber()
  useUserAgent()
  useEagerConnect()
  useAccountEventListener()
  useSentryUser()
  useThemeCookie()
  useLockedEndNotification()
  return null
}

function MPGlobalHooks() {
  usePollBlockNumber()
  // useEagerConnectMP()
  useUserAgent()
  useAccountEventListener()
  // useSentryUser()
  useLockedEndNotification()
  return null
}

function MyApp(props: AppProps<{ initialReduxState: any; dehydratedState: any }>) {
  const { pageProps, Component } = props
  const store = useStore(pageProps.initialReduxState)
  const { locale } = useRouter()

  // Choose the SEO config based on the current locale
  const seoConfig = locale === 'ko' ? defaultSeoKO : defaultSeoEN

  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=5, minimum-scale=1, viewport-fit=cover"
        />
        <meta name="theme-color" content="#000" />
      </Head>
      <DefaultSeo {...seoConfig} />
      <Providers store={store} dehydratedState={pageProps.dehydratedState}>
        {(Component as NextPageWithLayout).Meta && (
          // @ts-ignore
          <Component.Meta {...pageProps} />
        )}
        <Blocklist>
          {(Component as NextPageWithLayout).mp ? <MPGlobalHooks /> : <GlobalHooks />}
          <Updaters />
          <App {...props} />
        </Blocklist>
      </Providers>
      <Script
        strategy="afterInteractive"
        id="google-tag"
        dangerouslySetInnerHTML={{
          __html: `
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','${process.env.NEXT_PUBLIC_NEW_GTAG}');
          `,
        }}
      />
    </>
  )
}

MyApp.getInitialProps = async (appContext) => {
  // Get initial props for every page
  const appProps = await NextApp.getInitialProps(appContext)
  // Access the locale from the context (provided by Next.js i18n)
  const { locale } = appContext.ctx
  return { ...appProps, locale }
}

type NextPageWithLayout = NextPage & {
  Layout?: React.FC<React.PropsWithChildren<unknown>>
  /** render component without all layouts */
  pure?: true
  /** is mini program */
  mp?: boolean
  /**
   * allow chain per page, empty array bypass chain block modal
   * @default [ChainId.Klaytn]
   * */
  chains?: ChainId[]
  isShowScrollToTopButton?: true
  /**
   * Meta component for page, hacky solution for static build page to avoid `PersistGate` which blocks the page from rendering
   */
  Meta?: React.FC<React.PropsWithChildren<unknown>>
}

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout
}

const ProductionErrorBoundary = process.env.NODE_ENV === 'production' ? ErrorBoundary : Fragment

const emptyInitialI18NextConfig = {
  i18n: {
    defaultLocale: nextI18NextConfig.i18n.defaultLocale,
    locales: nextI18NextConfig.i18n.locales,
  },
}

const App = ({ Component, pageProps }: AppPropsWithLayout) => {
  const { chainId } = useActiveWeb3React()
  const isPageNotSupported = chainId !== ChainId.KLAYTN

  if (Component.pure && !isPageNotSupported) {
    return <Component {...pageProps} />
  }

  // Use the layout defined at the page level, if available
  const Layout = Component.Layout || Fragment
  const isShowScrollToTopButton = Component.isShowScrollToTopButton || true

  return (
    <ProductionErrorBoundary>
      <Menu />
      <Layout>{isPageNotSupported ? <Oops /> : <Component {...pageProps} />}</Layout>

      <Footer />
      <ToastListener />
      <NetworkModal />
      {isShowScrollToTopButton && <ScrollToTopButtonV2 />}
    </ProductionErrorBoundary>
  )
}

export default appWithTranslation(MyApp, emptyInitialI18NextConfig as any)
