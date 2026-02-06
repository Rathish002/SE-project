// Home (Dashboard) page component
// Shows welcome message, current settings, and basic learning stats

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { User } from 'firebase/auth';
import { getInterfaceLanguage, getLearningDirection } from '../utils/languageManager';
import { loadActivity } from '../utils/activityTracker';
import { setupPresenceSystem } from '../services/presenceService';
import { setupAcceptanceListener } from '../services/friendService';
import './Home.css';

interface HomeProps {
  currentUser?: User | null;
}

const Home: React.FC<HomeProps> = ({ currentUser }) => {
  const { t } = useTranslation();
  const [activity, setActivity] = useState(loadActivity());
  
  // Get current settings
  const interfaceLang = getInterfaceLanguage();
  const learningDir = getLearningDirection();
  
  // Static stats (placeholder data)
  const lessonsStarted = 0;
  const lessonsCompleted = 0;
  
  // Load activity on mount
  useEffect(() => {
    setActivity(loadActivity());
  }, []);
  
  // Setup presence system and friend request listener
  useEffect(() => {
    if (currentUser?.uid) {
      // Initialize presence system
      const cleanupPresence = setupPresenceSystem(currentUser.uid);
      
      // Setup friend request acceptance listener
      const cleanupAcceptance = setupAcceptanceListener(currentUser.uid);
      
      return () => {
        cleanupPresence();
        cleanupAcceptance();
      };
    }
  }, [currentUser?.uid]);
  
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
        <h1>
          {t('home.welcome')}
          {currentUser && (
            <span className="home-username"> {' '}{currentUser.displayName || (currentUser.email ? currentUser.email.split('@')[0] : '')}</span>
          )}
        </h1>
        
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
              <div className="stat-value">
                {activity.lastConversationName || activity.lastFriendName || t('home.lastActivityPlaceholder')}
              </div>
            </div>
          </div>
        </div>

        {/* Collaboration Activity */}
        {(activity.lastConversationName || activity.lastFriendName) && (
          <div className="home-section">
            <h2>{t('home.collaboration.title')}</h2>
            {activity.lastConversationName && (
              <div className="home-activity-item">
                <span className="home-activity-label">{t('home.collaboration.lastConversation')}:</span>
                <span className="home-activity-value">{activity.lastConversationName}</span>
              </div>
            )}
            {activity.lastFriendName && (
              <div className="home-activity-item">
                <span className="home-activity-label">{t('home.collaboration.lastFriend')}:</span>
                <span className="home-activity-value">{activity.lastFriendName}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
