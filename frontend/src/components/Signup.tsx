// Signup page component
// Allows users to create a new account with email and password

import React, { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import './Auth.css';

interface SignupProps {
  onSwitchToLogin: () => void;
}

const Signup: React.FC<SignupProps> = ({ onSwitchToLogin }) => {
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
      setError('Passwords do not match. Please try again.');
      setLoading(false);
      return;
    }

    // Validation: Check password length
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      setLoading(false);
      return;
    }

    try {
      // Create user account with Firebase
      await createUserWithEmailAndPassword(auth, email, password);
      setSuccess('Account created successfully! You can now log in.');
      // Clear form
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      // Handle different Firebase error codes
      let errorMessage = 'Failed to create account. Please try again.';
      
      if (err.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered. Please log in instead.';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (err.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please choose a stronger password.';
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
      let errorMessage = 'Failed to sign up with Google. Please try again.';
      
      if (err.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Sign-up popup was closed. Please try again.';
      } else if (err.code === 'auth/popup-blocked') {
        errorMessage = 'Popup was blocked by browser. Please allow popups and try again.';
      } else if (err.code === 'auth/cancelled-popup-request') {
        errorMessage = 'Only one popup request is allowed at a time.';
      }
      
      setError(errorMessage);
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h1>Create Account</h1>
        <p className="auth-subtitle">Sign up to get started</p>

        <form onSubmit={handleSubmit} className="auth-form">
          {/* Email input */}
          <div className="form-group">
            <label htmlFor="signup-email">Email Address</label>
            <input
              id="signup-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              disabled={loading}
              aria-label="Email address"
            />
          </div>

          {/* Password input */}
          <div className="form-group">
            <label htmlFor="signup-password">Password</label>
            <input
              id="signup-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password (min 6 characters)"
              required
              disabled={loading}
              aria-label="Password"
              minLength={6}
            />
          </div>

          {/* Confirm password input */}
          <div className="form-group">
            <label htmlFor="signup-confirm-password">Confirm Password</label>
            <input
              id="signup-confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              required
              disabled={loading}
              aria-label="Confirm password"
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
            aria-label="Create account"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        {/* Divider */}
        <div className="auth-divider">
          <span>OR</span>
        </div>

        {/* Google sign-up button */}
        <button
          type="button"
          onClick={handleGoogleSignUp}
          className="google-button"
          disabled={loading || googleLoading}
          aria-label="Sign up with Google"
        >
          {googleLoading ? 'Signing up...' : 'Sign up with Google'}
        </button>

        {/* Switch to login */}
        <div className="auth-switch">
          <p>Already have an account?</p>
          <button 
            type="button"
            onClick={onSwitchToLogin}
            className="switch-button"
            disabled={loading}
            aria-label="Switch to login page"
          >
            Log In
          </button>
        </div>
      </div>
    </div>
  );
};

export default Signup;
