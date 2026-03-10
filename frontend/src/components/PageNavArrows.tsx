import React, { useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import './PageNavArrows.css';
import { Page } from './Navigation';

interface PageNavArrowsProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

// Fixed navigation sequence mapping
const PAGE_SEQUENCE: Page[] = ['home', 'lessons', 'collaboration', 'settings'];

const PageNavArrows: React.FC<PageNavArrowsProps> = ({ currentPage, onNavigate }) => {
  const { t } = useTranslation();

  const currentIndex = PAGE_SEQUENCE.indexOf(currentPage);
  const prevPage = currentIndex > 0 ? PAGE_SEQUENCE[currentIndex - 1] : null;
  const nextPage = currentIndex < PAGE_SEQUENCE.length - 1 ? PAGE_SEQUENCE[currentIndex + 1] : null;

  const navigatePrev = useCallback(() => {
    if (prevPage) onNavigate(prevPage);
  }, [prevPage, onNavigate]);

  const navigateNext = useCallback(() => {
    if (nextPage) onNavigate(nextPage);
  }, [nextPage, onNavigate]);

  // Global Keyboard Shortcuts (arrow keys)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input or textarea
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }
      if (e.key === 'ArrowLeft') {
        navigatePrev();
      } else if (e.key === 'ArrowRight') {
        navigateNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigatePrev, navigateNext]);

  return (
    <div className="page-nav-arrows-container">
      <button
        className="page-nav-arrow left"
        onClick={navigatePrev}
        disabled={!prevPage}
        aria-label={`${t('navigation.previous')}${prevPage ? `: ${t(`navigation.${prevPage}`)}` : ''}`}
        title={prevPage ? t(`navigation.${prevPage}`) : ''}
      >
        <span>◀</span>
      </button>

      <button
        className="page-nav-arrow right"
        onClick={navigateNext}
        disabled={!nextPage}
        aria-label={`${t('navigation.next')}${nextPage ? `: ${t(`navigation.${nextPage}`)}` : ''}`}
        title={nextPage ? t(`navigation.${nextPage}`) : ''}
      >
        <span>▶</span>
      </button>
    </div>
  );
};

export default PageNavArrows;
