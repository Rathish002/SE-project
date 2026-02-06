/**
 * Accessibility Context
 * Provides global accessibility state and actions
 * SE-project style implementation
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { AccessibilityPreferences, ThemeMode, FontSize, AudioSpeed } from '../types/accessibility';
import { DEFAULT_PREFERENCES } from '../types/accessibility';
import { savePreferences, loadPreferences } from '../utils/accessibilityStorage';

interface AccessibilityContextType {
  preferences: AccessibilityPreferences;
  updateTheme: (theme: ThemeMode) => void;
  updateFontSize: (size: FontSize) => void;
  updateAudioSpeed: (speed: AudioSpeed) => void;
  updateContrastMode: (enabled: boolean) => void;
  updateDistractionFreeMode: (enabled: boolean) => void;
  updateReducedMotion: (enabled: boolean) => void;
  updateDyslexiaFont: (enabled: boolean) => void;
  updateBlueLightFilter: (enabled: boolean) => void;
  updateReadingMask: (enabled: boolean) => void;
  saveCurrentPreferences: () => void;
  resetToDefaults: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

interface AccessibilityProviderProps {
  children: ReactNode;
}

export const AccessibilityProvider: React.FC<AccessibilityProviderProps> = ({ children }) => {
  const [preferences, setPreferences] = useState<AccessibilityPreferences>(DEFAULT_PREFERENCES);

  // Load preferences on mount
  useEffect(() => {
    const loaded = loadPreferences();
    setPreferences(loaded);
    applyTheme(loaded.theme);
    applyFontSize(loaded.fontSize);
    applyContrastMode(loaded.contrastMode);
    applyReducedMotion(loaded.reducedMotion);
    applyDyslexiaFont(loaded.dyslexiaFont);
    // blueLightFilter and readingMask are handled by AccessibilityOverlays component
    // distractionFreeMode doesn't need a DOM attribute, it's state-based
  }, []);

  // Apply theme to document
  const applyTheme = (theme: ThemeMode) => {
    document.documentElement.setAttribute('data-theme', theme);
  };

  // Apply font size to document
  const applyFontSize = (size: number) => {
    const root = document.documentElement;
    root.style.setProperty('--base-font-size', `${size}px`);
    root.style.setProperty('--heading-1', `${size * 2}px`);
    root.style.setProperty('--heading-2', `${size * 1.5}px`);
    root.style.setProperty('--heading-3', `${size * 1.25}px`);
    // Remove old data attribute if it exists
    root.removeAttribute('data-font-size');
  };

  // Apply contrast mode to document
  const applyContrastMode = (enabled: boolean) => {
    if (enabled) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  };

  const applyReducedMotion = (enabled: boolean) => {
    if (enabled) {
      document.documentElement.classList.add('reduced-motion');
    } else {
      document.documentElement.classList.remove('reduced-motion');
    }
  };

  const applyDyslexiaFont = (enabled: boolean) => {
    if (enabled) {
      document.documentElement.classList.add('dyslexia-font');
    } else {
      document.documentElement.classList.remove('dyslexia-font');
    }
  };

  const updateTheme = (theme: ThemeMode) => {
    setPreferences(prev => ({ ...prev, theme }));
    applyTheme(theme);
  };

  const updateFontSize = (fontSize: FontSize) => {
    setPreferences(prev => ({ ...prev, fontSize }));
    applyFontSize(fontSize);
  };

  const updateAudioSpeed = (audioSpeed: AudioSpeed) => {
    setPreferences(prev => ({ ...prev, audioSpeed }));
  };

  const updateContrastMode = (contrastMode: boolean) => {
    setPreferences(prev => ({ ...prev, contrastMode }));
    applyContrastMode(contrastMode);
  };

  const updateDistractionFreeMode = (distractionFreeMode: boolean) => {
    setPreferences(prev => ({ ...prev, distractionFreeMode }));
  };

  const updateReducedMotion = (reducedMotion: boolean) => {
    setPreferences(prev => ({ ...prev, reducedMotion }));
    applyReducedMotion(reducedMotion);
  };

  const updateDyslexiaFont = (dyslexiaFont: boolean) => {
    setPreferences(prev => ({ ...prev, dyslexiaFont }));
    applyDyslexiaFont(dyslexiaFont);
  };

  const updateBlueLightFilter = (blueLightFilter: boolean) => {
    setPreferences(prev => ({ ...prev, blueLightFilter }));
  };

  const updateReadingMask = (readingMask: boolean) => {
    setPreferences(prev => ({ ...prev, readingMask }));
  };

  const saveCurrentPreferences = () => {
    savePreferences(preferences);
  };

  const resetToDefaults = () => {
    setPreferences(DEFAULT_PREFERENCES);
    applyTheme(DEFAULT_PREFERENCES.theme);
    applyFontSize(DEFAULT_PREFERENCES.fontSize);
    applyContrastMode(DEFAULT_PREFERENCES.contrastMode);
    applyReducedMotion(DEFAULT_PREFERENCES.reducedMotion);
    applyDyslexiaFont(DEFAULT_PREFERENCES.dyslexiaFont);
    // Other states reset via setPreferences
    savePreferences(DEFAULT_PREFERENCES);
  };

  const value: AccessibilityContextType = {
    preferences,
    updateTheme,
    updateFontSize,
    updateAudioSpeed,
    updateContrastMode,
    updateDistractionFreeMode,
    updateReducedMotion,
    updateDyslexiaFont,
    updateBlueLightFilter,
    updateReadingMask,
    saveCurrentPreferences,
    resetToDefaults,
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = (): AccessibilityContextType => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
};
