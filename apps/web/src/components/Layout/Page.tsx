import { useTranslation } from '@pancakeswap/localization'
import clsx from 'clsx'
import { DEFAULT_META, getCustomMeta } from 'config/constants/meta'
import { NextSeo } from 'next-seo'
import { useRouter } from 'next/router'

export const PageMeta: React.FC<React.PropsWithChildren> = () => {
  const {
    t,
    i18n: { language: locale },
  } = useTranslation()
  const { pathname } = useRouter()

  const pageMeta = getCustomMeta(pathname, t, locale)

  if (!pageMeta) {
    return null
  }

  const { description, image } = { ...DEFAULT_META, ...pageMeta }

  return (
    <NextSeo
      title={pageMeta.title}
      description={description ? t(description) : undefined}
      openGraph={
        image
          ? {
              images: [{ url: image, alt: pageMeta?.title, type: 'image/jpeg' }],
            }
          : undefined
      }
    />
  )
}

const Page: React.FC<
  React.PropsWithChildren<React.HTMLAttributes<HTMLDivElement>> & { maxWidth?: string; className?: string }
> = ({ children, maxWidth = 'max-w-6xl', className, ...props }) => {
  return (
    <>
      <PageMeta />
      <div className={clsx('px-5 md:px-8 mx-auto', className, maxWidth)} {...props}>
        {children}
      </div>
    </>
  )
}

export default Page
