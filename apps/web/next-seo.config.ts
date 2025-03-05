import { DefaultSeoProps } from 'next-seo'

export const defaultSeoEN: DefaultSeoProps = {
  titleTemplate: '%s | DragonSwap',
  defaultTitle: 'DragonSwap - Kaia’s Leading DEX',
  description:
    'DragonSwap is Kaia’s No.1 DEX and an official partner of the Kaia Foundation, offering token swaps, concentrated liquidity (V3), and more.',
  twitter: {
    cardType: 'summary_large_image',
    handle: '@DragonSwap',
    site: '@DragonSwap',
  },
  openGraph: {
    title: 'DragonSwap - Kaia’s Leading DEX',
    description:
      'DragonSwap is Kaia’s No.1 DEX and an official partner of the Kaia Foundation, offering token swaps, concentrated liquidity (V3), and more.',
    images: [{ url: '/images/og-images/common.jpeg' }],
  },
}

export const defaultSeoKO: DefaultSeoProps = {
  titleTemplate: '%s | 드래곤스왑',
  defaultTitle: '드래곤스왑 - 카이아 1등 DEX',
  description:
    '드래곤스왑은 카이아 생태계 점유율 1위 DEX로, 재단 D2I 프로그램의 공식 파트너이며, 스왑·유동성 공급·파밍 등 다양한 서비스를 안정적으로 제공합니다.',
  twitter: {
    cardType: 'summary_large_image',
    handle: '@DragonSwap',
    site: '@DragonSwap',
  },
  openGraph: {
    title: '드래곤스왑 - 카이아 1등 DEX',
    description:
      '드래곤스왑은 카이아 생태계 점유율 1위 DEX로, 재단 D2I 프로그램의 공식 파트너이며, 스왑·유동성 공급·파밍 등 다양한 서비스를 안정적으로 제공합니다.',
    images: [{ url: '/images/og-images/common.jpeg' }],
  },
}
