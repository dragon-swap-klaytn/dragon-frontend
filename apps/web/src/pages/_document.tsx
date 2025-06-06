/* eslint-disable jsx-a11y/iframe-has-title */
import Document, { DocumentContext, Head, Html, Main, NextScript } from 'next/document'
import Script from 'next/script'
import { ServerStyleSheet } from 'styled-components'

const GTM_ID = 'GTM-NDFD4XSG'

const shouldInsertGTM = process.env.NODE_ENV === 'production'

class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const sheet = new ServerStyleSheet()
    const originalRenderPage = ctx.renderPage

    try {
      // eslint-disable-next-line no-param-reassign
      ctx.renderPage = () =>
        originalRenderPage({
          enhanceApp: (App) => (props) => sheet.collectStyles(<App {...props} />),
        })

      const initialProps = await Document.getInitialProps(ctx)
      return {
        ...initialProps,
        styles: (
          <>
            {initialProps.styles}
            {sheet.getStyleElement()}
          </>
        ),
      }
    } finally {
      sheet.seal()
    }
  }

  render() {
    return (
      <Html translate="no">
        <Head>
          {/* <!-- Google Tag Manager --> */}
          {shouldInsertGTM && (
            <Script
              id="google-tag-manager"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'Script','dataLayer','${GTM_ID}');
                `,
              }}
            />
          )}
          {/* <!-- End Google Tag Manager --> */}
          <link rel="shortcut icon" href="/logo.png" />
          <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
          {/* <link rel="manifest" href="/manifest.json" /> */}
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" />
          <link
            href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300..700&display=swap"
            rel="stylesheet"
          />
        </Head>
        <body>
          {/* <!-- Google Tag Manager (noscript) --> */}
          {shouldInsertGTM && (
            <noscript>
              <iframe
                title="Google Tag Manager"
                src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
                height="0"
                width="0"
                style={{
                  display: 'none',
                  visibility: 'hidden',
                }}
              />
            </noscript>
          )}
          {/* <!-- End Google Tag Manager (noscript) --> */}
          <Main />
          <NextScript />
          <div id="portal-root" />
        </body>
      </Html>
    )
  }
}

export default MyDocument
