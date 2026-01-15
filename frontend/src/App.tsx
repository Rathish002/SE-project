// Main App component
// Handles authentication state and displays Login/Signup or user status

import React, { useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import Login from './components/Login';
import Signup from './components/Signup';
import './App.css';

function App() {
  // State for current user
  const [user, setUser] = useState<User | null>(null);
  
  // State for showing login or signup page
  const [showSignup, setShowSignup] = useState<boolean>(false);
  
  // State for loading (checking auth state)
  const [loading, setLoading] = useState<boolean>(true);

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
        <p>Loading...</p>
      </div>
    );
  }

  // If user is logged in, show simple status message
  if (user) {
    return (
      <div className="app-container">
        <div className="welcome-box">
          <h1>Welcome!</h1>
          <p>You are logged in as:</p>
          <p className="user-email">{user.email}</p>
          <button 
            onClick={() => auth.signOut()}
            className="logout-button"
            aria-label="Log out"
          >
            Log Out
          </button>
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
