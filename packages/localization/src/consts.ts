export const LOCALES = ['en', 'ko'] as const
export type Locale = (typeof LOCALES)[number]
export const LOCALE_MAP: { [locale in Locale]: string } = {
  en: 'English',
  ko: '한국어',
}

export const DEFAULT_LANGUAGE: Locale = 'en'
