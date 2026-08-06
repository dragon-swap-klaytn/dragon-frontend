export const LOCALES = ['en'] as const
export type Locale = (typeof LOCALES)[number]
export const LOCALE_MAP: { [locale in Locale]: string } = {
  en: 'English',
}

export const DEFAULT_LANGUAGE: Locale = 'en'
