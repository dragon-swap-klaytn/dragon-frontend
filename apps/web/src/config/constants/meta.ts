import { TFunction } from '@pancakeswap/localization'
import memoize from 'lodash/memoize'
import { PageMeta } from './types'

export const DEFAULT_META: PageMeta = {
  title: 'DragonSwap',
  description: 'DragonSwap is the No.1 DEX for ecosystem liquidity and an official Kaia D2I partner.',
  image: `/images/og-images/common.jpeg`,
}

interface PathList {
  paths: {
    [path: string]: {
      title: string
      description?: string
      image?: string
    }
  }
  defaultTitleSuffix: string
}

const getPathList = (t: TFunction): PathList => {
  return {
    paths: {
      '/': { title: t('Main') },
      '/swap': { title: t('Swap'), image: '/images/og-images/swap.jpeg' },
      '/liquidity': { title: t('Liquidity') },
      '/increase': { title: t('Increase') },
      '/add': { title: t('Add Liquidity') },
      '/remove': { title: t('Remove Liquidity') },
      '/v2/pair': { title: t('Pair') },
      '/v2/add': { title: t('Add Liquidity') },
      '/v2/remove': { title: t('Remove Liquidity') },
      '/pools': { title: t('Pools'), image: '/images/og-images/pools.jpeg' },
      '/dashboard': { title: t('Dashboard'), image: '/images/og-images/dashboard.jpeg' },
    },
    defaultTitleSuffix: t('DragonSwap'),
  }
}

export const getCustomMeta = memoize(
  (path: string, t: TFunction, _: string): PageMeta => {
    const pathList = getPathList(t)
    const key =
      path === '/' ? '/' : Object.entries(pathList.paths).find(([url]) => url !== '/' && path.includes(url))?.[0]
    const pathMetadata = pathList.paths[path] ?? (key ? pathList.paths[key] : undefined)

    if (pathMetadata) {
      return {
        title: `${pathMetadata.title}`,
        ...(pathMetadata.description && { description: pathMetadata.description }),
        ...(pathMetadata.image && { image: pathMetadata.image }),
      }
    }

    return {
      title: pathList.defaultTitleSuffix,
    }
  },
  (path, t, locale) => `${path}#${locale}`,
)
