// Navigation component
// Provides consistent navigation across the app

import React from 'react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import ProfileMenu from './ProfileMenu';
import './Navigation.css';

export type Page = 'home' | 'lessons' | 'settings' | 'collaboration' | 'exercises';

interface NavigationProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  onLogout: () => void;
  showSideArrows?: boolean;
}

const Navigation: React.FC<NavigationProps> = ({ currentPage, onNavigate, onLogout, showSideArrows = true }) => {
  const { t } = useTranslation();

  const pages: Page[] = ['home', 'lessons', 'collaboration', 'settings'];
  const currentIndex = pages.indexOf(currentPage);
  const prevDisabled = currentIndex <= 0;
  const nextDisabled = currentIndex >= pages.length - 1;

  // Keyboard navigation (left/right arrows)
  React.useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      // Ignore when modifier keys are pressed or focus is in an input/control
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      const active = document.activeElement as HTMLElement | null;
      if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable)) return;

      if (e.key === 'ArrowLeft') {
        if (!prevDisabled) onNavigate(pages[currentIndex - 1]);
      } else if (e.key === 'ArrowRight') {
        if (!nextDisabled) onNavigate(pages[currentIndex + 1]);
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [currentIndex, nextDisabled, prevDisabled, onNavigate]);

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
        <ProfileMenu onSignOut={onLogout} onSettings={() => onNavigate('settings')} onProfile={() => onNavigate('home')} />
      </div>
      {showSideArrows && (
        <>
          <button
            id="sidePrev"
            className="side-arrow side-prev"
            onClick={() => { if (!prevDisabled) onNavigate(pages[currentIndex - 1]); }}
            aria-label={t('navigation.previous')}
            aria-disabled={prevDisabled}
            disabled={prevDisabled}
          >
            ◀
          </button>

          <button
            id="sideNext"
            className="side-arrow side-next"
            onClick={() => { if (!nextDisabled) onNavigate(pages[currentIndex + 1]); }}
            aria-label={t('navigation.next')}
            aria-disabled={nextDisabled}
            disabled={nextDisabled}
          >
            ▶
          </button>
        </>
      )}
    </nav>
  );
};

export default Navigation;
