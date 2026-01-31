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
  }, []);

  // Apply theme to document
  const applyTheme = (theme: ThemeMode) => {
    document.documentElement.setAttribute('data-theme', theme);
  };

  // Apply font size to document
  const applyFontSize = (size: FontSize) => {
    document.documentElement.setAttribute('data-font-size', size);
  };

  // Apply contrast mode to document
  const applyContrastMode = (enabled: boolean) => {
    if (enabled) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
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

  const saveCurrentPreferences = () => {
    savePreferences(preferences);
  };

  const resetToDefaults = () => {
    setPreferences(DEFAULT_PREFERENCES);
    applyTheme(DEFAULT_PREFERENCES.theme);
    applyFontSize(DEFAULT_PREFERENCES.fontSize);
    applyContrastMode(DEFAULT_PREFERENCES.contrastMode);
    savePreferences(DEFAULT_PREFERENCES);
  };

  const value: AccessibilityContextType = {
    preferences,
    updateTheme,
    updateFontSize,
    updateAudioSpeed,
    updateContrastMode,
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
