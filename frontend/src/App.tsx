// Main App component
// Handles authentication state and displays Login/Signup or user status

import React, { useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { useTranslation } from 'react-i18next';
import { auth } from './firebase';
import { initializeLanguageSettings } from './utils/appSettings';
import { useAccessibility, AccessibilityProvider } from './contexts/AccessibilityContext';
import { initializeUserProfile } from './services/userService';
import { setUserOnline, setUserOffline } from './services/presenceService';
import { setupAcceptanceListener } from './services/friendService';

import Login from './components/Login';
import Signup from './components/Signup';
import Home from './components/Home';
import LessonSelection from './components/LessonSelection';
import Learning from './components/Learning';
import UnifiedSettings from './components/UnifiedSettings';
import Collaboration from './components/Collaboration';
import Exercises from './components/Exercises';
import Navigation, { Page } from './components/Navigation';
import AccessibilityOverlays from './components/AccessibilityOverlays';
import TopBar from './components/TopBar';

import './i18n/i18n'; // Initialize i18n
import './App.css';

function App() {
  const { t, i18n } = useTranslation();

  const [user, setUser] = useState<User | null>(null);
  const [showSignup, setShowSignup] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const { preferences, updateDistractionFreeMode } = useAccessibility();
  const focusMode = preferences.distractionFreeMode;
  const setFocusMode = updateDistractionFreeMode;

  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Initialize language settings
  useEffect(() => {
    const { interfaceLanguage } = initializeLanguageSettings();
    i18n.changeLanguage(interfaceLanguage);
  }, [i18n]);

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser: User | null) => {
      if (currentUser) {
        try {
          await initializeUserProfile(currentUser);
          await setUserOnline(currentUser.uid);

          const unsubscribeAcceptance = setupAcceptanceListener(currentUser.uid);
          (window as any).__unsubscribeAcceptance = unsubscribeAcceptance;
        } catch (error) {
          console.error('Error initializing user profile:', error);
        }
      } else {
        if (user) {
          try {
            await setUserOffline(user.uid);

            if ((window as any).__unsubscribeAcceptance) {
              (window as any).__unsubscribeAcceptance();
            }
          } catch (error) {
            console.error('Error setting user offline:', error);
          }
        }
      }
      setUser(currentUser);
      setLoading(false);
    });

    return () => {
      unsubscribe();
      if ((window as any).__unsubscribeAcceptance) {
        (window as any).__unsubscribeAcceptance();
      }
    };
  }, [user]);

  if (loading) {
    return (
      <div className="loading-container">
        <p>{t('app.loading')}</p>
      </div>
    );
  }

  const handleNavigate = (page: Page) => {
    setCurrentPage(page);
    setSelectedLessonId(null);
    if (page !== 'lessons' && page !== 'collaboration') {
      setFocusMode(false);
    }
  };

  const handleSelectLesson = (lessonId: number) => {
    setSelectedLessonId(lessonId);
  };

  const handleBackFromLearning = () => {
    setSelectedLessonId(null);
    setCurrentPage('lessons');
    setFocusMode(false);
  };

  const handleNavigateLesson = (newLessonId: number) => {
    setSelectedLessonId(newLessonId);
  };

  const handleLogout = async () => {
    if (user) {
      try {
        await setUserOffline(user.uid);
      } catch (error) {
        console.error('Error setting user offline:', error);
      }
    }
    await auth.signOut();
    setCurrentPage('home');
    setSelectedLessonId(null);
  };

  if (user) {
    if (selectedLessonId !== null) {
      return (
        <AccessibilityProvider>
          <div className={`app-container ${focusMode ? 'focus-mode' : ''} ${!isSidebarOpen ? 'sidebar-closed' : ''}`}>
            {!focusMode && (
              <Navigation
                currentPage="lessons"
                onNavigate={handleNavigate}
                isOpen={isSidebarOpen}
                onToggle={toggleSidebar}
              />
            )}

            <div className="main-content">
              <Learning
                lessonId={selectedLessonId}
                onBack={handleBackFromLearning}
                onNavigateLesson={handleNavigateLesson}
                focusMode={focusMode}
                onFocusModeChange={setFocusMode}
                onNavigateToExercises={() => handleNavigate('exercises')}
              />
            </div>

            <AccessibilityOverlays />
          </div>
        </AccessibilityProvider>
      );
    }

    const isFocusModePage = currentPage === 'collaboration';

    return (
      <AccessibilityProvider>
        <div className={`app-container ${isFocusModePage && focusMode ? 'focus-mode' : ''} ${!isSidebarOpen ? 'sidebar-closed' : ''}`}>
          {!(isFocusModePage && focusMode) && (
            <Navigation
              currentPage={currentPage}
              onNavigate={handleNavigate}
              isOpen={isSidebarOpen}
              onToggle={toggleSidebar}
            />
          )}

          <div className="main-content">
            {!(isFocusModePage && focusMode) && (
              <TopBar
                isSidebarOpen={isSidebarOpen}
                onToggleSidebar={toggleSidebar}
                onLogout={handleLogout}
                onNavigate={handleNavigate}
              />
            )}

            {currentPage === 'home' && <Home currentUser={user} />}
            {currentPage === 'lessons' && (
              <LessonSelection onSelectLesson={handleSelectLesson} />
            )}
            {currentPage === 'exercises' && (
              <Exercises onNavigate={handleNavigate} />
            )}
            {currentPage === 'collaboration' && (
              <Collaboration
                currentUser={user}
                focusMode={focusMode}
                onFocusModeChange={setFocusMode}
              />
            )}
            {currentPage === 'settings' && (
              <UnifiedSettings onBack={() => handleNavigate('home')} />
            )}
          </div>

          <AccessibilityOverlays />
        </div>
      </AccessibilityProvider>
    );
  }

  return (
    <div className="app-container auth-mode">
      {showSignup ? (
        <Signup onSwitchToLogin={() => setShowSignup(false)} />
      ) : (
        <Login onSwitchToSignup={() => setShowSignup(true)} />
      )}
    </div>
  );
}

export default App;
