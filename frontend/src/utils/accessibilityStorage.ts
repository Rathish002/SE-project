/**
 * Accessibility Storage Utilities
 * Manages accessibility preferences in LocalStorage
 */

import type { AccessibilityPreferences } from '../types/accessibility';
import { DEFAULT_PREFERENCES } from '../types/accessibility';

const STORAGE_KEY = 'se-project-accessibility-preferences';

/**
 * Save accessibility preferences to LocalStorage
 */
export const savePreferences = (preferences: AccessibilityPreferences): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  } catch (error) {
    console.warn('Failed to save accessibility preferences:', error);
  }
};

/**
 * Load accessibility preferences from LocalStorage
 */
export const loadPreferences = (): AccessibilityPreferences => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Validate structure
      if (
        parsed &&
        typeof parsed === 'object' &&
        ['light', 'dark', 'high-contrast'].includes(parsed.theme) &&
        ['small', 'medium', 'large'].includes(parsed.fontSize) &&
        [0.75, 1.0, 1.25, 1.5].includes(parsed.audioSpeed) &&
        typeof parsed.contrastMode === 'boolean'
      ) {
        return parsed as AccessibilityPreferences;
      }
    }
  } catch (error) {
    console.warn('Failed to load accessibility preferences:', error);
  }
  return DEFAULT_PREFERENCES;
};
