import { Language } from '../types'

export const EN: Language = { locale: 'en-US', language: 'English', code: 'en' }
export const KO: Language = { locale: 'ko-KR', language: '한국어', code: 'ko' }

export const languages: Record<string, Language> = {
  'en-US': EN,
  'ko-KR': KO,
}

const languageList = Object.values(languages)

export default languageList
