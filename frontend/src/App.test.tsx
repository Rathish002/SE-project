import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

jest.mock('./contexts/AccessibilityContext', () => ({
  AccessibilityProvider: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  useAccessibility: () => ({
    preferences: { distractionFreeMode: false },
    updateDistractionFreeMode: jest.fn(),
  }),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { changeLanguage: jest.fn() },
  }),
}));

jest.mock('./i18n/i18n', () => ({}));

jest.mock('./utils/languageManager', () => ({
  initializeLanguageSettings: () => ({ interfaceLanguage: 'en' }),
}));

jest.mock('firebase/auth', () => ({
  onAuthStateChanged: (_auth: unknown, callback: (user: null) => void) => {
    callback(null);
    return jest.fn();
  },
}));

jest.mock('./firebase', () => ({
  auth: { signOut: jest.fn() },
}));

jest.mock('./services/userService', () => ({
  initializeUserProfile: jest.fn(),
}));

jest.mock('./services/presenceService', () => ({
  setUserOnline: jest.fn(),
  setUserOffline: jest.fn(),
}));

jest.mock('./services/friendService', () => ({
  setupAcceptanceListener: jest.fn(() => jest.fn()),
}));

jest.mock('./components/Login', () => () => <div>Login</div>);
jest.mock('./components/Signup', () => () => <div>Signup</div>);
jest.mock('./components/Home', () => () => <div>Home</div>);
jest.mock('./components/LessonSelection', () => () => <div>Lessons</div>);
jest.mock('./components/Learning', () => () => <div>Learning</div>);
jest.mock('./components/UnifiedSettings', () => () => <div>Settings</div>);
jest.mock('./components/Collaboration', () => () => <div>Collaboration</div>);
jest.mock('./components/Exercises', () => () => <div>Exercises</div>);
jest.mock('./components/Navigation', () => () => <div>Navigation</div>);
jest.mock('./components/AccessibilityOverlays', () => () => <div>Overlays</div>);

test('shows login when user is signed out', () => {
  render(<App />);
  expect(screen.getByText('Login')).toBeInTheDocument();
});
