/**
 * English + Tagalog from day one (plan §3.1 H.4). Add a language by adding locales/<code>.json
 * with the same keys and listing it in LANGUAGES.
 */
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';
import en from '../locales/en.json';
import tl from '../locales/tl.json';

export const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'tl', label: 'Tagalog' },
] as const;
export type Language = (typeof LANGUAGES)[number]['code'];

/** Tagalog/Filipino phones start in Tagalog; everyone else in English. */
export function detectLanguage(): Language {
  const code = getLocales()[0]?.languageCode;
  return code === 'tl' || code === 'fil' ? 'tl' : 'en';
}

i18next
  .use(initReactI18next)
  .init({
    resources: { en: { translation: en }, tl: { translation: tl } },
    lng: detectLanguage(),
    fallbackLng: 'en',
    interpolation: { escapeValue: false }, // React already escapes
    returnNull: false,
  })
  .catch(() => {});

export const i18n = i18next;
