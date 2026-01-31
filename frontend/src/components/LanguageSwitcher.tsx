/**
 * Global Language Switcher Component
 * Visible on all authenticated pages
 * Shows language names as endonyms (English / हिन्दी)
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  getInterfaceLanguage,
  setInterfaceLanguage,
  InterfaceLanguage,
} from '../utils/languageManager';
import './LanguageSwitcher.css';

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();
  const [currentLang, setCurrentLang] = useState<InterfaceLanguage>(getInterfaceLanguage());

  // Update when language changes externally
  useEffect(() => {
    const handleLanguageChange = (lng: string) => {
      if (lng === 'en' || lng === 'hi') {
        setCurrentLang(lng as InterfaceLanguage);
      }
    };

    i18n.on('languageChanged', handleLanguageChange);
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value as InterfaceLanguage;
    setInterfaceLanguage(newLang);
    setCurrentLang(newLang);
    i18n.changeLanguage(newLang);
  };

  return (
    <div className="language-switcher">
      <label htmlFor="global-language-switcher" className="language-switcher-label">
        <span className="language-switcher-icon">🌐</span>
        <select
          id="global-language-switcher"
          value={currentLang}
          onChange={handleLanguageChange}
          className="language-switcher-select"
          aria-label="Interface language"
        >
          <option value="en">English</option>
          <option value="hi">हिन्दी</option>
        </select>
      </label>
    </div>
  );
};

export default LanguageSwitcher;
