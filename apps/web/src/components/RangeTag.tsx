import { useTranslation } from '@pancakeswap/localization'
import { QuestionHelper, TagV2, TagV2Props } from '@pancakeswap/uikit'
import { ReactNode } from 'react'

export function RangeTag({
  removed,
  outOfRange,
  children,
  questionHelper,
}: { removed?: boolean; outOfRange: boolean; children?: ReactNode; questionHelper?: string } & TagV2Props) {
  const { t } = useTranslation()

  return removed ? (
    <TagV2>{children || t('Closed')}</TagV2>
  ) : outOfRange ? (
    <TagV2 color="red">
      {children || (
        <div className="flex items-center space-x-1">
          <span>{t('Inactive')}</span>

          <QuestionHelper
            text={
              questionHelper ||
              t(
                'The position is inactive and not earning trading fees due to the current price being out of the set price range.',
              )
            }
            placement="bottom"
            background="bg-gray-600"
            color="text-on-surface"
          />
        </div>
      )}
    </TagV2>
  ) : (
    <TagV2 color="green">{children || t('Active')}</TagV2>
  )
}
