import { DefaultSeoProps } from 'next-seo'

export const SEO: DefaultSeoProps = {
  titleTemplate: '%s | DragonSwap',
  defaultTitle: 'DragonSwap - Kaia’s Leading DEX',
  description: 'DragonSwap is the No.1 DEX for ecosystem liquidity and an official Kaia D2I partner.',
  twitter: {
    cardType: 'summary_large_image',
    handle: '@DragonSwap',
    site: '@DragonSwap',
  },
  openGraph: {
    title: 'DragonSwap - Kaia’s Leading DEX',
    description: 'DragonSwap is the No.1 DEX for ecosystem liquidity and an official Kaia D2I partner.',
    images: [{ url: '/images/og-images/common.jpeg' }],
  },
}
