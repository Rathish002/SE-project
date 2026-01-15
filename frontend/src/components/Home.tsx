// Home (Dashboard) page component
// Shows welcome message, current settings, and basic learning stats

import React from 'react';
import { useTranslation } from 'react-i18next';
import { getInterfaceLanguage, getLearningDirection } from '../utils/languageManager';
import './Home.css';

const Home: React.FC = () => {
  const { t } = useTranslation();
  
  // Get current settings
  const interfaceLang = getInterfaceLanguage();
  const learningDir = getLearningDirection();
  
  // Static stats (placeholder data)
  const lessonsStarted = 0;
  const lessonsCompleted = 0;
  const lastActivity = t('home.lastActivityPlaceholder');
  
  // Get display text for interface language
  const getInterfaceLanguageText = (): string => {
    return interfaceLang === 'en' ? t('settings.english') : t('settings.hindi');
  };
  
  // Get display text for learning direction
  const getLearningDirectionText = (): string => {
    return learningDir === 'en-to-hi' 
      ? t('settings.englishToHindi') 
      : t('settings.hindiToEnglish');
  };

  return (
    <div className="home-container">
      <div className="home-content">
        <h1>{t('home.welcome')}</h1>
        
        {/* Current Settings */}
        <div className="home-section">
          <h2>{t('home.interfaceLanguage')}</h2>
          <p className="home-value">{getInterfaceLanguageText()}</p>
        </div>
        
        <div className="home-section">
          <h2>{t('home.learningDirection')}</h2>
          <p className="home-value">{getLearningDirectionText()}</p>
        </div>
        
        {/* Learning Stats */}
        <div className="home-section">
          <h2>{t('home.stats.title')}</h2>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-label">{t('home.stats.lessonsStarted')}</div>
              <div className="stat-value">{lessonsStarted}</div>
            </div>
            <div className="stat-item">
              <div className="stat-label">{t('home.stats.lessonsCompleted')}</div>
              <div className="stat-value">{lessonsCompleted}</div>
            </div>
            <div className="stat-item">
              <div className="stat-label">{t('home.stats.lastActivity')}</div>
              <div className="stat-value">{lastActivity}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
