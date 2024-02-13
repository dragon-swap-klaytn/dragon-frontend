import { useTranslation } from '@pancakeswap/localization'
import { SubMenuItems } from '@pancakeswap/uikit'
import { useRouter } from 'next/router'
import { useMemo } from 'react'
import { useMultiChainPath } from 'state/info/hooks'

import InfoNav from './components/InfoNav'

export const InfoPageLayout = ({ children }) => {
  const router = useRouter()

  const chainPath = useMultiChainPath()
  const { t } = useTranslation()
  const isStableSwap = router.query.type === 'stableSwap'
  const subMenuItems = useMemo(() => {
    const config = [
      {
        label: t('V3'),
        href: `/info/v3${chainPath}`,
      },
      {
        label: t('V2'),
        href: `/info${chainPath}`,
      },
    ]

    return config
  }, [t, chainPath])

  return (
    <>
      <SubMenuItems
        items={subMenuItems}
        activeItem={isStableSwap ? `/info${chainPath}?type=stableSwap` : `/info${chainPath}`}
      />

      <InfoNav isStableSwap={false} />
      {children}
    </>
  )
}
