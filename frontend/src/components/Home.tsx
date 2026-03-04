// Home (Dashboard) page component
// Shows welcome message, current settings, and basic learning stats

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { User } from 'firebase/auth';
import { getInterfaceLanguage, getLearningDirection } from '../utils/languageManager';
import { loadActivity } from '../utils/activityTracker';
import { setupPresenceSystem } from '../services/presenceService';
import { setupAcceptanceListener } from '../services/friendService';
import { LessonIcon, CompleteIcon, ActivityIcon, LanguageIcon, DirectionIcon, CollaborationIcon } from './HomeIcons';
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

  const displayName = currentUser?.displayName || (currentUser?.email ? currentUser.email.split('@')[0] : '');

  return (
    <div className="home-container fade-in">
      <div className="home-content">
        {/* Hero Section */}
        <div className="home-hero">
          <h1>
            {t('home.welcome')}
            {displayName && <span className="home-username"> {displayName}</span>}
          </h1>
          <p className="home-subtitle">{t('app.loggedInAs')} {currentUser?.email}</p>
        </div>

        {/* Settings Info Cards */}
        <div className="info-cards-container">
          <div className="info-card">
            <div className="info-icon-wrapper">
              <LanguageIcon size={28} />
            </div>
            <div className="info-content">
              <h3>{t('home.interfaceLanguage')}</h3>
              <p>{getInterfaceLanguageText()}</p>
            </div>
          </div>

          <div className="info-card">
            <div className="info-icon-wrapper">
              <DirectionIcon size={28} />
            </div>
            <div className="info-content">
              <h3>{t('home.learningDirection')}</h3>
              <p>{getLearningDirectionText()}</p>
            </div>
          </div>
        </div>

        {/* Learning Stats */}
        <div className="home-section">
          <h2 className="section-title">
            <ActivityIcon className="section-icon" />
            {t('home.stats.title')}
          </h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon-bg">
                <LessonIcon size={32} />
              </div>
              <div className="stat-info">
                <div className="stat-value">{lessonsStarted}</div>
                <div className="stat-label">{t('home.stats.lessonsStarted')}</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-bg success">
                <CompleteIcon size={32} />
              </div>
              <div className="stat-info">
                <div className="stat-value">{lessonsCompleted}</div>
                <div className="stat-label">{t('home.stats.lessonsCompleted')}</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-bg info">
                <ActivityIcon size={32} />
              </div>
              <div className="stat-info">
                <div className="stat-value text-small">
                  {activity.lastConversationName || activity.lastFriendName || t('home.lastActivityPlaceholder')}
                </div>
                <div className="stat-label">{t('home.stats.lastActivity')}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Collaboration Activity */}
        {(activity.lastConversationName || activity.lastFriendName) && (
          <div className="home-section">
            <h2 className="section-title">
              <CollaborationIcon className="section-icon" />
              {t('home.collaboration.title')}
            </h2>
            <div className="activity-list">
              {activity.lastConversationName && (
                <div className="activity-item">
                  <span className="activity-label">{t('home.collaboration.lastConversation')}</span>
                  <span className="activity-value">{activity.lastConversationName}</span>
                </div>
              )}
              {activity.lastFriendName && (
                <div className="activity-item">
                  <span className="activity-label">{t('home.collaboration.lastFriend')}</span>
                  <span className="activity-value">{activity.lastFriendName}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
