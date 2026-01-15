// i18next configuration and initialization
// Sets up internationalization for English and Hindi

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslations from './en.json';
import hiTranslations from './hi.json';

// Initialize i18next
i18n
  .use(initReactI18next) // Passes i18n down to react-i18next
  .init({
    // Default language
    lng: 'en',
    
    // Fallback language if translation is missing
    fallbackLng: 'en',
    
    // Resources: translations for each language
    resources: {
      en: {
        translation: enTranslations
      },
      hi: {
        translation: hiTranslations
      }
    },
    
    // Interpolation options
    interpolation: {
      escapeValue: false // React already escapes values
    },
    
    // React-specific options
    react: {
      useSuspense: false // Disable suspense for simpler setup
    },
    
    // Return empty string for missing keys instead of showing key path
    returnEmptyString: false,
    
    // Return objects for missing keys
    returnObjects: true
  });

export default i18n;
