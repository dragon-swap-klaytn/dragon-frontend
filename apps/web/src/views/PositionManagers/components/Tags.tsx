import { useTranslation } from '@pancakeswap/localization'
import { Tag, TagProps } from '@pancakeswap/uikit'
import { FarmWidget } from '@pancakeswap/widgets-internal'
import { memo } from 'react'

const { V3FeeTag, CompoundingPoolTag } = FarmWidget.Tags

export const FarmTag = memo(function FarmTag(props: TagProps) {
  const { t } = useTranslation()
  return (
    <Tag variant="warning" outline {...props}>
      {t('Farm')}
    </Tag>
  )
})

export const SingleTokenTag = memo(function SingleTokenTag(props: TagProps) {
  const { t } = useTranslation()
  return (
    <Tag variant="success" outline {...props}>
      {t('Single Token')}
    </Tag>
  )
})

export { CompoundingPoolTag as AutoCompoundTag, V3FeeTag as FeeTag }
