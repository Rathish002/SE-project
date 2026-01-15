// Signup page component
// Allows users to create a new account with email and password

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import './Auth.css';

interface SignupProps {
  onSwitchToLogin: () => void;
}

const Signup: React.FC<SignupProps> = ({ onSwitchToLogin }) => {
  const { t } = useTranslation();
  
  // State for form inputs
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  
  // State for UI feedback
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [googleLoading, setGoogleLoading] = useState<boolean>(false);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Validation: Check if passwords match
    if (password !== confirmPassword) {
      setError(t('auth.errors.passwordsNoMatch'));
      setLoading(false);
      return;
    }

    // Validation: Check password length
    if (password.length < 6) {
      setError(t('auth.errors.passwordTooShort'));
      setLoading(false);
      return;
    }

    try {
      // Create user account with Firebase
      await createUserWithEmailAndPassword(auth, email, password);
      setSuccess(t('auth.success.accountCreated'));
      // Clear form
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      // Handle different Firebase error codes
      let errorMessage = t('auth.errors.signupFailed');
      
      if (err.code === 'auth/email-already-in-use') {
        errorMessage = t('auth.errors.emailInUse');
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = t('auth.errors.invalidEmail');
      } else if (err.code === 'auth/weak-password') {
        errorMessage = t('auth.errors.weakPassword');
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handle Google sign-up
  const handleGoogleSignUp = async () => {
    setError('');
    setSuccess('');
    setGoogleLoading(true);

    try {
      // Sign in with Google popup (works for both new and existing users)
      await signInWithPopup(auth, googleProvider);
      // Success: onAuthStateChanged in App.tsx will handle the state update
    } catch (err: any) {
      // Handle different Firebase error codes
      let errorMessage = t('auth.errors.googleSignUpFailed');
      
      if (err.code === 'auth/popup-closed-by-user') {
        errorMessage = t('auth.errors.signupPopupClosed');
      } else if (err.code === 'auth/popup-blocked') {
        errorMessage = t('auth.errors.signupPopupBlocked');
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
        <h1>{t('auth.signup.title')}</h1>
        <p className="auth-subtitle">{t('auth.signup.subtitle')}</p>

        <form onSubmit={handleSubmit} className="auth-form">
          {/* Email input */}
          <div className="form-group">
            <label htmlFor="signup-email">{t('auth.signup.email')}</label>
            <input
              id="signup-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('auth.signup.emailPlaceholder')}
              required
              disabled={loading || googleLoading}
              aria-label={t('auth.signup.email')}
            />
          </div>

          {/* Password input */}
          <div className="form-group">
            <label htmlFor="signup-password">{t('auth.signup.password')}</label>
            <input
              id="signup-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('auth.signup.passwordPlaceholder')}
              required
              disabled={loading || googleLoading}
              aria-label={t('auth.signup.password')}
              minLength={6}
            />
          </div>

          {/* Confirm password input */}
          <div className="form-group">
            <label htmlFor="signup-confirm-password">{t('auth.signup.confirmPassword')}</label>
            <input
              id="signup-confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t('auth.signup.confirmPasswordPlaceholder')}
              required
              disabled={loading || googleLoading}
              aria-label={t('auth.signup.confirmPassword')}
              minLength={6}
            />
          </div>

          {/* Error message */}
          {error && <div className="error-message" role="alert">{error}</div>}

          {/* Success message */}
          {success && <div className="success-message" role="alert">{success}</div>}

          {/* Submit button */}
          <button 
            type="submit" 
            className="auth-button"
            disabled={loading || googleLoading}
            aria-label={t('auth.signup.submit')}
          >
            {loading ? t('auth.signup.submitting') : t('auth.signup.submit')}
          </button>
        </form>

        {/* Divider */}
        <div className="auth-divider">
          <span>{t('auth.signup.or')}</span>
        </div>

        {/* Google sign-up button */}
        <button
          type="button"
          onClick={handleGoogleSignUp}
          className="google-button"
          disabled={loading || googleLoading}
          aria-label={t('auth.signup.googleSignUp')}
        >
          {googleLoading ? t('auth.signup.googleSigningUp') : t('auth.signup.googleSignUp')}
        </button>

        {/* Switch to login */}
        <div className="auth-switch">
          <p>{t('auth.signup.switchToLogin')}</p>
          <button 
            type="button"
            onClick={onSwitchToLogin}
            className="switch-button"
            disabled={loading || googleLoading}
            aria-label={t('auth.signup.logIn')}
          >
            {t('auth.signup.logIn')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Signup;
