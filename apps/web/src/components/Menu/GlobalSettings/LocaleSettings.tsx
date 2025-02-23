import { Transition } from '@headlessui/react'
import { DEFAULT_LANGUAGE, Locale, LOCALE_MAP, useTranslation } from '@pancakeswap/localization'
import { ButtonV2 } from '@pancakeswap/uikit'
import { CaretRight } from '@phosphor-icons/react'
import clsx from 'clsx'
import { atom, useAtom } from 'jotai'
import { useRouter } from 'next/router'

import { useCallback, useEffect, useState } from 'react'

export const currentLocaleAtom = atom<Locale>('en')

export default function LocaleSettings({
  className,
  onClickLocale,
}: {
  className?: string
  onClickLocale?: () => void
}) {
  const [currentLocale, setCurrentLocale] = useAtom(currentLocaleAtom)
  const [showLocale, setShowLocale] = useState(false)
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
        setShowLocale(false)
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

      <div className="flex flex-col items-end">
        <div className="flex items-center space-x-1">
          <button
            type="button"
            className="text-sm text-on-surface"
            onClick={() => {
              setShowLocale((prev) => !prev)
            }}
          >
            {LOCALE_MAP[currentLocale]}
          </button>

          <CaretRight
            height={16}
            width={16}
            className={clsx('text-on-surface', {
              'transform rotate-90': showLocale,
            })}
          />
        </div>

        <Transition
          show={showLocale}
          enter="transition-opacity duration-100"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="flex items-center space-x-2 mt-6">
            {Object.entries(LOCALE_MAP).map(([_locale, title]) => (
              <ButtonV2
                key={`locale-${_locale}`}
                onClick={() => handleLocaleChange(_locale as Locale)}
                className={clsx('rounded-[20px] p-2 text-sm hover:opacity-70 px-4 h-10 whitespace-nowrap', {
                  'bg-brand': (_locale as Locale) === currentLocale,
                  'bg-surface-disable': (_locale as Locale) !== currentLocale,
                })}
                variant={(_locale as Locale) === currentLocale ? 'primary' : 'subtle'}
              >
                {title}
              </ButtonV2>
            ))}
          </div>
        </Transition>
      </div>
    </div>
  )
}
