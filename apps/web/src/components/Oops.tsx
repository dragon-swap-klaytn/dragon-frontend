import { ButtonV2 } from '@pancakeswap/uikit'
import { useTranslation } from 'next-i18next'

export default function Ooops() {
  const { t } = useTranslation()
  return (
    <div className="flex flex-col items-center justify-center space-y-3 h-[60vh]">
      <p className="text-on-surface text-lg">{t('Oops, something wrong.')}</p>

      <ButtonV2 variant="primary" onClick={() => location.reload()}>
        Reload
      </ButtonV2>
    </div>
  )
}
