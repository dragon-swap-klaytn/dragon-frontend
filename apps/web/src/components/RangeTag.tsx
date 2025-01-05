import { useTranslation } from '@pancakeswap/localization'
import { QuestionHelper, TagProps } from '@pancakeswap/uikit'
import Chip from 'components/Common/Chip'
import { ReactNode } from 'react'

export function RangeTag({
  removed,
  outOfRange,
  children,
  questionHelper,
}: { removed?: boolean; outOfRange: boolean; children?: ReactNode; questionHelper?: string } & TagProps) {
  const { t } = useTranslation()

  return removed ? (
    <Chip>{children || t('Closed')}</Chip>
  ) : outOfRange ? (
    <Chip color="red">
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
            color="text-on-surface-primary"
          />
        </div>
      )}
    </Chip>
  ) : (
    <Chip color="green">{children || t('Active')}</Chip>
  )
}
