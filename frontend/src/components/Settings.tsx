// Settings component
// Allows users to change interface language and learning direction

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  getInterfaceLanguage,
  setInterfaceLanguage,
  getLearningDirection,
  setLearningDirection,
  InterfaceLanguage,
  LearningDirection
} from '../utils/languageManager';
import './Settings.css';

interface SettingsProps {
  onBack?: () => void;
  onNavigateToAccessibility?: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onBack, onNavigateToAccessibility }) => {
  const { t, i18n } = useTranslation();
  
  // State for current settings
  const [interfaceLang, setInterfaceLang] = useState<InterfaceLanguage>(getInterfaceLanguage());
  const [learningDir, setLearningDir] = useState<LearningDirection>(getLearningDirection());

  // Update i18n language when interface language changes
  useEffect(() => {
    i18n.changeLanguage(interfaceLang);
  }, [interfaceLang, i18n]);

  // Handle interface language change
  const handleInterfaceLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value as InterfaceLanguage;
    setInterfaceLanguage(newLang);
    setInterfaceLang(newLang);
    i18n.changeLanguage(newLang);
  };

  // Handle learning direction change
  const handleLearningDirectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDir = e.target.value as LearningDirection;
    setLearningDirection(newDir);
    setLearningDir(newDir);
  };

  // Get learning direction info text
  const getLearningInfo = (): string => {
    if (learningDir === 'en-to-hi') {
      return t('settings.learningInfo.enToHi');
    } else {
      return t('settings.learningInfo.hiToEn');
    }
  };

  return (
    <div className="settings-container">
      <div className="settings-box">
        <h1>{t('settings.title')}</h1>

        {/* Interface Language Selector */}
        <div className="settings-group">
          <label htmlFor="interface-language">
            {t('settings.interfaceLanguage')}
          </label>
          <select
            id="interface-language"
            value={interfaceLang}
            onChange={handleInterfaceLanguageChange}
            className="settings-select"
            aria-label={t('settings.interfaceLanguage')}
          >
            <option value="en">{t('settings.english')}</option>
            <option value="hi">{t('settings.hindi')}</option>
          </select>
        </div>

        {/* Learning Direction Selector */}
        <div className="settings-group">
          <label htmlFor="learning-direction">
            {t('settings.learningDirection')}
          </label>
          <select
            id="learning-direction"
            value={learningDir}
            onChange={handleLearningDirectionChange}
            className="settings-select"
            aria-label={t('settings.learningDirection')}
          >
            <option value="hi-to-en">{t('settings.englishToHindi')}</option>
            <option value="en-to-hi">{t('settings.hindiToEnglish')}</option>
          </select>
        </div>

        {/* Learning Direction Info */}
        <div className="learning-info">
          <p>{getLearningInfo()}</p>
        </div>
        
        {/* Action buttons */}
        <div className="settings-actions">
          {onNavigateToAccessibility && (
            <button
              onClick={onNavigateToAccessibility}
              className="settings-button settings-button-primary"
              aria-label={t('navigation.accessibility')}
            >
              {t('navigation.accessibility')}
            </button>
          )}
          {onBack && (
            <button
              onClick={onBack}
              className="settings-back-button"
              aria-label={t('app.back')}
            >
              {t('app.back')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
