// Main App component
// Handles authentication state and displays Login/Signup or user status

import React, { useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { useTranslation } from 'react-i18next';
import { auth } from './firebase';
import { initializeLanguageSettings } from './utils/languageManager';
import Login from './components/Login';
import Signup from './components/Signup';
import Home from './components/Home';
import LessonSelection from './components/LessonSelection';
import Learning from './components/Learning';
import Settings from './components/Settings';
import Navigation, { Page } from './components/Navigation';
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

  // Initialize language settings from LocalStorage on app start
  useEffect(() => {
    const { interfaceLanguage } = initializeLanguageSettings();
    i18n.changeLanguage(interfaceLanguage);
  }, [i18n]);

  // Monitor authentication state changes
  useEffect(() => {
    // onAuthStateChanged returns an unsubscribe function
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    // Cleanup: unsubscribe when component unmounts
    return () => unsubscribe();
  }, []);

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
  };

  // Handle lesson selection
  const handleSelectLesson = (lessonId: number) => {
    setSelectedLessonId(lessonId);
  };

  // Handle back from learning page
  const handleBackFromLearning = () => {
    setSelectedLessonId(null);
    setCurrentPage('lessons');
  };

  // Handle logout
  const handleLogout = async () => {
    await auth.signOut();
    setCurrentPage('home');
    setSelectedLessonId(null);
  };

  // If user is logged in, show main app with navigation
  if (user) {
    // Show learning page if a lesson is selected
    if (selectedLessonId !== null) {
      return (
        <div className="app-container">
          <Navigation
            currentPage="lessons"
            onNavigate={handleNavigate}
            onLogout={handleLogout}
          />
          <Learning
            lessonId={selectedLessonId}
            onBack={handleBackFromLearning}
          />
        </div>
      );
    }

    // Show main pages with navigation
    return (
      <div className="app-container">
        <Navigation
          currentPage={currentPage}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
        />
        <div className="main-content">
          {currentPage === 'home' && <Home />}
          {currentPage === 'lessons' && (
            <LessonSelection onSelectLesson={handleSelectLesson} />
          )}
          {currentPage === 'settings' && (
            <Settings onBack={() => handleNavigate('home')} />
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
