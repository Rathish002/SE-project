/**
 * Accessibility Types and Interfaces
 * Defines the structure for accessibility preferences
 */

export type ThemeMode = 'light' | 'dark' | 'high-contrast';
export type FontSize = number;
export type AudioSpeed = 0.75 | 1.0 | 1.25 | 1.5;

export interface AccessibilityPreferences {
  theme: ThemeMode;
  fontSize: FontSize;
  audioSpeed: AudioSpeed;
  contrastMode: boolean;
  distractionFreeMode: boolean;
  reducedMotion: boolean;
  dyslexiaFont: boolean;
  blueLightFilter: boolean;
  readingMask: boolean;
}

export const DEFAULT_PREFERENCES: AccessibilityPreferences = {
  theme: 'light',
  fontSize: 16,
  audioSpeed: 1.0,
  contrastMode: false,
  distractionFreeMode: false,
  reducedMotion: false,
  dyslexiaFont: false,
  blueLightFilter: false,
  readingMask: false,
};
