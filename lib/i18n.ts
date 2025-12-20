import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// English translations
import enCommon from '../locales/locales/en/common.json';
import enAuth from '../locales/locales/en/auth.json';
import enDashboard from '../locales/locales/en/dashboard.json';
import enDocuments from '../locales/locales/en/documents.json';
import enAdmin from '../locales/locales/en/admin.json';

// Portuguese translations
import ptCommon from '../locales/locales/pt/common.json';
import ptAuth from '../locales/locales/pt/auth.json';
import ptDashboard from '../locales/locales/pt/dashboard.json';
import ptDocuments from '../locales/locales/pt/documents.json';
import ptAdmin from '../locales/locales/pt/admin.json';

// French translations
import frCommon from '../locales/locales/fr/common.json';
import frAuth from '../locales/locales/fr/auth.json';
import frDashboard from '../locales/locales/fr/dashboard.json';
import frDocuments from '../locales/locales/fr/documents.json';
import frAdmin from '../locales/locales/fr/admin.json';

export const defaultNS = 'common';

export const resources = {
  en: {
    common: enCommon,
    auth: enAuth,
    dashboard: enDashboard,
    documents: enDocuments,
    admin: enAdmin,
  },
  pt: {
    common: ptCommon,
    auth: ptAuth,
    dashboard: ptDashboard,
    documents: ptDocuments,
    admin: ptAdmin,
  },
  fr: {
    common: frCommon,
    auth: frAuth,
    dashboard: frDashboard,
    documents: frDocuments,
    admin: frAdmin,
  },
} as const;

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    defaultNS,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'doctrack-language',
    },
    // Para Next.js, desabilitar SSR para i18n
    react: {
      useSuspense: false,
    },
  });

export default i18n;

// Helper to get current language
export const getCurrentLanguage = () => i18n.language || 'en';

// Helper to change language
export const changeLanguage = (lng: string) => {
  i18n.changeLanguage(lng);
  localStorage.setItem('doctrack-language', lng);
  // Update HTML lang attribute
  document.documentElement.lang = lng;
};

// Supported languages
export const supportedLanguages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
] as const;

export type SupportedLanguage = typeof supportedLanguages[number]['code'];

