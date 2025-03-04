import clsx from 'clsx'
import { NextSeo } from 'next-seo'

const Page: React.FC<
  React.PropsWithChildren<React.HTMLAttributes<HTMLDivElement>> & {
    title?: string
    description?: string
    image?: string
    maxWidth?: string
    className?: string
  }
> = ({ title, description, image, children, maxWidth = 'max-w-6xl', className, ...props }) => {
  return (
    <>
      <NextSeo
        title={title}
        description={description}
        openGraph={
          image
            ? {
                images: [{ url: image, alt: title, type: 'image/jpeg' }],
              }
            : undefined
        }
      />
      <div className={clsx('px-5 md:px-8 mx-auto', className, maxWidth)} {...props}>
        {children}
      </div>
    </>
  )
}

export default Page
