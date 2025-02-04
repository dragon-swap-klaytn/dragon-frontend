import { Transition } from '@headlessui/react'
import { languageList, useTranslation } from '@pancakeswap/localization'
import { ButtonV2 } from '@pancakeswap/uikit'
import { CaretRight } from '@phosphor-icons/react'
import clsx from 'clsx'
import { useState } from 'react'

export default function LanguageSettings({
  className,
  onClickLanguage,
}: {
  className?: string
  onClickLanguage: () => void
}) {
  const { currentLanguage, setLanguage, t } = useTranslation()
  const [showLanguage, setShowLanguage] = useState(false)

  return (
    <div className={clsx('flex items-start justify-between w-full space-x-2', className)}>
      <h4 className="text-sm text-on-surface">{t('Language')}</h4>

      <div className="flex flex-col items-end">
        <div className="flex items-center space-x-1">
          <button
            type="button"
            className="text-sm text-on-surface"
            onClick={() => {
              setShowLanguage((prev) => !prev)
            }}
          >
            {currentLanguage.language}
          </button>

          <CaretRight
            height={16}
            width={16}
            className={clsx('text-on-surface', {
              'transform rotate-90': showLanguage,
            })}
          />
        </div>

        <Transition
          show={showLanguage}
          enter="transition-opacity duration-100"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="flex items-center space-x-2 mt-6">
            {languageList.map((lang) => (
              <ButtonV2
                key={lang.code}
                onClick={() => {
                  setLanguage(lang)
                  setShowLanguage(false)
                  onClickLanguage()
                }}
                className={clsx('rounded-[20px] p-2 text-sm hover:opacity-70 px-4 h-10 whitespace-nowrap', {
                  'bg-brand': lang.code === currentLanguage.code,
                  'bg-surface-disable': lang.code !== currentLanguage.code,
                })}
                variant={lang.code === currentLanguage.code ? 'primary' : 'subtle'}
              >
                {lang.language}
              </ButtonV2>
            ))}
          </div>
        </Transition>
      </div>
    </div>
  )
}
