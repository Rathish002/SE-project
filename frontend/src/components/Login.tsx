// Login page component
// Allows users to sign in with email and password

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import './Auth.css';

interface LoginProps {
  onSwitchToSignup: () => void;
}

const Login: React.FC<LoginProps> = ({ onSwitchToSignup }) => {
  const { t } = useTranslation();
  
  // State for form inputs
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  
  // State for UI feedback
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [googleLoading, setGoogleLoading] = useState<boolean>(false);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Sign in user with Firebase
      await signInWithEmailAndPassword(auth, email, password);
      // Success: onAuthStateChanged in App.tsx will handle the state update
    } catch (err: any) {
      // Handle different Firebase error codes
      let errorMessage = t('auth.errors.loginFailed');
      
      if (err.code === 'auth/user-not-found') {
        errorMessage = t('auth.errors.userNotFound');
      } else if (err.code === 'auth/wrong-password') {
        errorMessage = t('auth.errors.wrongPassword');
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = t('auth.errors.invalidEmail');
      } else if (err.code === 'auth/invalid-credential') {
        errorMessage = t('auth.errors.invalidCredential');
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = t('auth.errors.tooManyRequests');
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handle Google sign-in
  const handleGoogleSignIn = async () => {
    setError('');
    setGoogleLoading(true);

    try {
      // Sign in with Google popup
      await signInWithPopup(auth, googleProvider);
      // Success: onAuthStateChanged in App.tsx will handle the state update
    } catch (err: any) {
      // Handle different Firebase error codes
      let errorMessage = t('auth.errors.googleSignInFailed');
      
      if (err.code === 'auth/popup-closed-by-user') {
        errorMessage = t('auth.errors.popupClosed');
      } else if (err.code === 'auth/popup-blocked') {
        errorMessage = t('auth.errors.popupBlocked');
      } else if (err.code === 'auth/cancelled-popup-request') {
        errorMessage = t('auth.errors.popupCancelled');
      }
      
      setError(errorMessage);
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h1>{t('auth.login.title')}</h1>
        <p className="auth-subtitle">{t('auth.login.subtitle')}</p>

        <form onSubmit={handleSubmit} className="auth-form">
          {/* Email input */}
          <div className="form-group">
            <label htmlFor="login-email">{t('auth.login.email')}</label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('auth.login.emailPlaceholder')}
              required
              disabled={loading || googleLoading}
              aria-label={t('auth.login.email')}
            />
          </div>

          {/* Password input */}
          <div className="form-group">
            <label htmlFor="login-password">{t('auth.login.password')}</label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('auth.login.passwordPlaceholder')}
              required
              disabled={loading || googleLoading}
              aria-label={t('auth.login.password')}
            />
          </div>

          {/* Error message */}
          {error && <div className="error-message" role="alert">{error}</div>}

          {/* Submit button */}
          <button 
            type="submit" 
            className="auth-button"
            disabled={loading || googleLoading}
            aria-label={t('auth.login.submit')}
          >
            {loading ? t('auth.login.submitting') : t('auth.login.submit')}
          </button>
        </form>

        {/* Divider */}
        <div className="auth-divider">
          <span>{t('auth.login.or')}</span>
        </div>

        {/* Google sign-in button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="google-button"
          disabled={loading || googleLoading}
          aria-label={t('auth.login.googleSignIn')}
        >
          {googleLoading ? t('auth.login.googleSigningIn') : t('auth.login.googleSignIn')}
        </button>

        {/* Switch to signup */}
        <div className="auth-switch">
          <p>{t('auth.login.switchToSignup')}</p>
          <button 
            type="button"
            onClick={onSwitchToSignup}
            className="switch-button"
            disabled={loading || googleLoading}
            aria-label={t('auth.login.signUp')}
          >
            {t('auth.login.signUp')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
