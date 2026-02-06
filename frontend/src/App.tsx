// Main App component
// Handles authentication state and displays Login/Signup or user status

import React, { useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { useTranslation } from 'react-i18next';
import { auth } from './firebase';
import { initializeLanguageSettings } from './utils/languageManager';
import { useAccessibility } from './contexts/AccessibilityContext';
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
import './i18n/i18n'; // Initialize i18n
import './App.css';

function App() {
  const { t, i18n } = useTranslation();

  // State for current user
  const [user, setUser] = useState<User | null>(null);

  // State for showing login or signup page
  const [showSignup, setShowSignup] = useState<boolean>(false);

  // State for current page (for logged-in users)
  const [currentPage, setCurrentPage] = useState<Page>('home');

  // State for selected lesson (when viewing learning page)
  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null);

  // State for loading (checking auth state)
  const [loading, setLoading] = useState<boolean>(true);


  // Get accessibility preferences
  const { preferences, updateDistractionFreeMode } = useAccessibility();
  const focusMode = preferences.distractionFreeMode;
  const setFocusMode = updateDistractionFreeMode;

  // Initialize language settings from LocalStorage on app start
  useEffect(() => {
    const { interfaceLanguage } = initializeLanguageSettings();
    i18n.changeLanguage(interfaceLanguage);
  }, [i18n]);

  // Monitor authentication state changes
  useEffect(() => {
    // onAuthStateChanged returns an unsubscribe function
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Initialize user profile and presence
        try {
          await initializeUserProfile(currentUser);
          await setUserOnline(currentUser.uid);

          // Setup listener for friend request acceptance (completes bidirectional adds)
          const unsubscribeAcceptance = setupAcceptanceListener(currentUser.uid);

          // Store unsubscriber for cleanup
          (window as any).__unsubscribeAcceptance = unsubscribeAcceptance;
        } catch (error) {
          console.error('Error initializing user profile:', error);
        }
      } else {
        // User logged out - set offline if there was a previous user
        if (user) {
          try {
            await setUserOffline(user.uid);

            // Cleanup acceptance listener
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

    // Cleanup: unsubscribe when component unmounts
    return () => {
      unsubscribe();
      if ((window as any).__unsubscribeAcceptance) {
        (window as any).__unsubscribeAcceptance();
      }
    };
  }, [user]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="loading-container">
        <p>{t('app.loading')}</p>
      </div>
    );
  }

  // Handle navigation
  const handleNavigate = (page: Page) => {
    setCurrentPage(page);
    setSelectedLessonId(null); // Clear selected lesson when navigating
    // Reset focus mode when navigating away from lesson/collaboration pages
    if (page !== 'lessons' && page !== 'collaboration') {
      setFocusMode(false);
    }
  };

  // Handle lesson selection
  const handleSelectLesson = (lessonId: number) => {
    setSelectedLessonId(lessonId);
  };

  // Handle back from learning page
  const handleBackFromLearning = () => {
    setSelectedLessonId(null);
    setCurrentPage('lessons');
    setFocusMode(false); // Reset focus mode when leaving lesson
  };

  // Handle lesson navigation (previous/next)
  const handleNavigateLesson = (newLessonId: number) => {
    setSelectedLessonId(newLessonId);
  };

  // Handle logout
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

  // If user is logged in, show main app with navigation
  if (user) {
    // Show learning page if a lesson is selected
    if (selectedLessonId !== null) {
      return (
        <div className={`app-container ${focusMode ? 'focus-mode' : ''}`}>
          <AccessibilityOverlays />
          {!focusMode && (
            <Navigation
              currentPage="lessons"
              onNavigate={handleNavigate}
              onLogout={handleLogout}
            />
          )}
          <Learning
            lessonId={selectedLessonId}
            onBack={handleBackFromLearning}
            onNavigateLesson={handleNavigateLesson}
            focusMode={focusMode}
            onFocusModeChange={setFocusMode}
            onNavigateToExercises={() => handleNavigate('exercises')}
          />
        </div>
      );
    }

    // Show main pages with navigation
    // Focus mode only applies to lesson/collaboration pages
    const isFocusModePage = currentPage === 'collaboration';

    return (
      <div className={`app-container ${isFocusModePage && focusMode ? 'focus-mode' : ''}`}>
        <AccessibilityOverlays />
        {!(isFocusModePage && focusMode) && (
          <Navigation
            currentPage={currentPage}
            onNavigate={handleNavigate}
            onLogout={handleLogout}
          />
        )}
        <div className="main-content">
          {currentPage === 'home' && <Home currentUser={user} />}
          {currentPage === 'lessons' && (
            <LessonSelection onSelectLesson={handleSelectLesson} />
          )}
          {currentPage === 'exercises' && (
            <Exercises onNavigate={handleNavigate} />
          )}
          {currentPage === 'collaboration' && user && (
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
      </div>
    );
  }

  // If user is not logged in, show Login or Signup
  return (
    <div className="app-container">
      {showSignup ? (
        <Signup onSwitchToLogin={() => setShowSignup(false)} />
      ) : (
        <Login onSwitchToSignup={() => setShowSignup(true)} />
      )}
    </div>
  );
}

export default App;
