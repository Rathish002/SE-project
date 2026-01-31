/**
 * Accessibility Types and Interfaces
 * Defines the structure for accessibility preferences
 */

export type ThemeMode = 'light' | 'dark' | 'high-contrast';
export type FontSize = 'small' | 'medium' | 'large';
export type AudioSpeed = 0.75 | 1.0 | 1.25 | 1.5;

export interface AccessibilityPreferences {
  theme: ThemeMode;
  fontSize: FontSize;
  audioSpeed: AudioSpeed;
  contrastMode: boolean;
}

export const DEFAULT_PREFERENCES: AccessibilityPreferences = {
  theme: 'light',
  fontSize: 'medium',
  audioSpeed: 1.0,
  contrastMode: false,
};
