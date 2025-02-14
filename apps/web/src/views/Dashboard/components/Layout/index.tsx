import { useTranslation } from '@pancakeswap/localization'
import { SubMenuItems } from '@pancakeswap/uikit'
import { useRouter } from 'next/router'
import { useMemo } from 'react'
import { v3InfoPath } from '../../constants'
import InfoNav from './InfoNav'

export const InfoPageLayout = ({ children }) => {
  const router = useRouter()

  const isV3 = router?.pathname?.includes(v3InfoPath)
  const { t } = useTranslation()

  const subMenuItems = useMemo(() => {
    const config = [
      {
        label: t('V3'),
        href: `/info/v3`,
      },
      {
        label: t('V2'),
        href: `/info`,
      },
    ]

    return config
  }, [t])

  return (
    <>
      <SubMenuItems items={subMenuItems} activeItem={isV3 ? `/dashboard/v3` : `/dashboard`} />
      <InfoNav />
      {children}
    </>
  )
}
