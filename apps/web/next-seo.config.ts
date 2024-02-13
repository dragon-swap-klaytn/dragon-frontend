import { DefaultSeoProps } from 'next-seo'

export const SEO: DefaultSeoProps = {
  titleTemplate: '%s | DragonSwap',
  defaultTitle: 'DragonSwap',
  description: 'Last of Klaytn and First of Project Dragon DEX',
  twitter: {
    cardType: 'summary_large_image',
    handle: '@DragonSwap',
    site: '@DragonSwap',
  },
  openGraph: {
    title: "🥞 DragonSwap - Last of Klaytn and First of Project Dragon",
    description: 'Last of Klaytn and First of Project Dragon DEX',
    images: [{ url: '/images/decorations/dgs-light.png' }],
  },
}
