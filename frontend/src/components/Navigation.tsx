// Navigation component (Sidebar)
// Provides consistent vertical navigation across the app

import React from 'react';
import { useTranslation } from 'react-i18next';
import './Navigation.css';

export type Page = 'home' | 'lessons' | 'settings' | 'collaboration' | 'exercises';

interface NavigationProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  isOpen?: boolean;
  onToggle?: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentPage, onNavigate, isOpen = true, onToggle }) => {
  const { t } = useTranslation();

  return (
    <nav className={`navigation sidebar ${!isOpen ? 'closed' : ''}`} role="navigation" aria-label="Main navigation">
      <div className="sidebar-header">
        <h1 className="app-brand white-text">{isOpen ? 'VaultGuard' : 'VG'}</h1>
        {onToggle && (
          <button className="collapse-btn" onClick={onToggle} aria-label="Toggle sidebar">
            {isOpen ? '◀' : '▶'}
          </button>
        )}
      </div>

      <div className="nav-links">
        <button
          className={`nav-button ${currentPage === 'home' ? 'active' : ''}`}
          onClick={() => onNavigate('home')}
          aria-label={t('navigation.home')}
          aria-current={currentPage === 'home' ? 'page' : undefined}
          title={!isOpen ? t('navigation.home') : ''}
        >
          <span className="nav-icon">🏠</span>
          {isOpen && <span className="nav-text">{t('navigation.home')}</span>}
        </button>
        <button
          className={`nav-button ${currentPage === 'lessons' ? 'active' : ''}`}
          onClick={() => onNavigate('lessons')}
          aria-label={t('navigation.lessons')}
          aria-current={currentPage === 'lessons' ? 'page' : undefined}
          title={!isOpen ? t('navigation.lessons') : ''}
        >
          <span className="nav-icon">📚</span>
          {isOpen && <span className="nav-text">{t('navigation.lessons')}</span>}
        </button>
        <button
          className={`nav-button ${currentPage === 'collaboration' ? 'active' : ''}`}
          onClick={() => onNavigate('collaboration')}
          aria-label={t('navigation.collaboration')}
          aria-current={currentPage === 'collaboration' ? 'page' : undefined}
          title={!isOpen ? t('navigation.collaboration') : ''}
        >
          <span className="nav-icon">👥</span>
          {isOpen && <span className="nav-text">{t('navigation.collaboration')}</span>}
        </button>
        <button
          className={`nav-button ${currentPage === 'settings' ? 'active' : ''}`}
          onClick={() => onNavigate('settings')}
          aria-label={t('navigation.settings')}
          aria-current={currentPage === 'settings' ? 'page' : undefined}
          title={!isOpen ? t('navigation.settings') : ''}
        >
          <span className="nav-icon">⚙️</span>
          {isOpen && <span className="nav-text">{t('navigation.settings')}</span>}
        </button>
      </div>
    </nav>
  );
};

export default Navigation;
