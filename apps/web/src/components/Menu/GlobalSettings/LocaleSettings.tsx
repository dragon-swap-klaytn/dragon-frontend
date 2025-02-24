import { DEFAULT_LANGUAGE, Locale, LOCALE_MAP, useTranslation } from '@pancakeswap/localization'
import { CustomSelect } from '@pancakeswap/uikit'
import clsx from 'clsx'
import { atom, useAtom } from 'jotai'
import { useRouter } from 'next/router'

import { useCallback, useEffect } from 'react'

export const currentLocaleAtom = atom<Locale>('en')

const localeOptions = Object.entries(LOCALE_MAP).map(([locale, title]) => ({
  value: locale,
  label: title,
}))

export default function LocaleSettings({
  className,
  onClickLocale,
}: {
  className?: string
  onClickLocale?: () => void
}) {
  const [currentLocale, setCurrentLocale] = useAtom(currentLocaleAtom)
  const router = useRouter()
  const {
    t,
    i18n: { language: locale },
  } = useTranslation()

  useEffect(() => {
    setCurrentLocale((locale as Locale) || DEFAULT_LANGUAGE)
  }, [locale, setCurrentLocale])

  const handleLocaleChange = useCallback(
    async (newLocale: Locale) => {
      if (locale === newLocale) return

      try {
        setCurrentLocale(newLocale)
        onClickLocale?.()

        await router.replace(router.asPath, router.asPath, { locale: newLocale })
      } catch (error) {
        console.error('Language change failed:', error)
      }
    },
    [onClickLocale, setCurrentLocale, locale, router],
  )

  return (
    <div className={clsx('flex items-start justify-between w-full space-x-2', className)}>
      <h4 className="text-sm text-on-surface">{t('Language')}</h4>

      <div className="z-60 w-32">
        <CustomSelect
          options={localeOptions}
          selectedOption={localeOptions.find(({ value }) => value === currentLocale)!}
          onSelect={(newLocale) => handleLocaleChange(newLocale.value as Locale)}
        />
      </div>
    </div>
  )
}
