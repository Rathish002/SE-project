// Navigation component
// Provides consistent navigation across the app

import React from 'react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import './Navigation.css';

export type Page = 'home' | 'lessons' | 'settings' | 'collaboration';

interface NavigationProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  onLogout: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentPage, onNavigate, onLogout }) => {
  const { t } = useTranslation();

  return (
    <nav className="navigation" role="navigation" aria-label="Main navigation">
      <div className="nav-container">
        <button
          className={`nav-button ${currentPage === 'home' ? 'active' : ''}`}
          onClick={() => onNavigate('home')}
          aria-label={t('navigation.home')}
          aria-current={currentPage === 'home' ? 'page' : undefined}
        >
          {t('navigation.home')}
        </button>
        <button
          className={`nav-button ${currentPage === 'lessons' ? 'active' : ''}`}
          onClick={() => onNavigate('lessons')}
          aria-label={t('navigation.lessons')}
          aria-current={currentPage === 'lessons' ? 'page' : undefined}
        >
          {t('navigation.lessons')}
        </button>
        <button
          className={`nav-button ${currentPage === 'collaboration' ? 'active' : ''}`}
          onClick={() => onNavigate('collaboration')}
          aria-label={t('navigation.collaboration')}
          aria-current={currentPage === 'collaboration' ? 'page' : undefined}
        >
          {t('navigation.collaboration')}
        </button>
        <button
          className={`nav-button ${currentPage === 'settings' ? 'active' : ''}`}
          onClick={() => onNavigate('settings')}
          aria-label={t('navigation.settings')}
          aria-current={currentPage === 'settings' ? 'page' : undefined}
        >
          {t('navigation.settings')}
        </button>
        <LanguageSwitcher />
        <button
          className="nav-button nav-button-logout"
          onClick={onLogout}
          aria-label={t('navigation.logout')}
        >
          {t('navigation.logout')}
        </button>
      </div>
    </nav>
  );
};

export default Navigation;
