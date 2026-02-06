/**
 * Accessibility Settings Page
 * Main hub for all accessibility controls
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccessibility } from '../contexts/AccessibilityContext';
import type { ThemeMode, FontSize, AudioSpeed } from '../types/accessibility';
import './AccessibilitySettings.css';

interface AccessibilitySettingsProps {
  onBack?: () => void;
}

const AccessibilitySettings: React.FC<AccessibilitySettingsProps> = ({ onBack }) => {
  const { t } = useTranslation();
  const {
    preferences,
    updateTheme,
    updateFontSize,
    updateAudioSpeed,
    updateContrastMode,
    saveCurrentPreferences,
    resetToDefaults,
  } = useAccessibility();

  const [showSaveMessage, setShowSaveMessage] = useState(false);
  const [showResetMessage, setShowResetMessage] = useState(false);

  const handleSave = () => {
    saveCurrentPreferences();
    setShowSaveMessage(true);
    setTimeout(() => setShowSaveMessage(false), 3000);
  };

  const handleReset = () => {
    if (window.confirm(t('accessibility.resetConfirm'))) {
      resetToDefaults();
      setShowResetMessage(true);
      setTimeout(() => setShowResetMessage(false), 3000);
    }
  };

  const themeOptions: { value: ThemeMode; label: string; icon: string }[] = [
    { value: 'light', label: t('accessibility.theme.light'), icon: '☀️' },
    { value: 'dark', label: t('accessibility.theme.dark'), icon: '🌙' },
    { value: 'high-contrast', label: t('accessibility.theme.highContrast'), icon: '⚡' },
  ];

  const fontSizeOptions: { value: FontSize; label: string }[] = [
    { value: 14, label: t('accessibility.fontSize.small') }, // Reduced from default
    { value: 16, label: t('accessibility.fontSize.medium') }, // Default
    { value: 20, label: t('accessibility.fontSize.large') }, // Increased
  ];

  const audioSpeedOptions: AudioSpeed[] = [0.75, 1.0, 1.25, 1.5];

  return (
    <div className="accessibility-settings">
      <header className="settings-header">
        <h1>{t('accessibility.title')}</h1>
        <p>{t('accessibility.subtitle')}</p>
      </header>

      {/* Theme Selection */}
      <section className="settings-section card">
        <h2>{t('accessibility.theme.title')}</h2>
        <p className="section-description">
          {t('accessibility.theme.description')}
        </p>
        <div className="theme-options">
          {themeOptions.map((option) => (
            <button
              key={option.value}
              className={`theme-button ${preferences.theme === option.value ? 'active' : ''}`}
              onClick={() => updateTheme(option.value)}
              aria-pressed={preferences.theme === option.value}
            >
              <span className="theme-icon">{option.icon}</span>
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Font Size Controls */}
      <section className="settings-section card">
        <h2>{t('accessibility.fontSize.title')}</h2>
        <p className="section-description">
          {t('accessibility.fontSize.description')}
        </p>
        <div className="font-size-controls">
          {fontSizeOptions.map((option) => (
            <button
              key={option.value}
              className={`font-button ${preferences.fontSize === option.value ? 'active' : ''}`}
              onClick={() => updateFontSize(option.value)}
              aria-pressed={preferences.fontSize === option.value}
            >
              {option.label}
            </button>
          ))}
        </div>
        <div className="preview-text">
          <p className="preview-sample">
            {t('accessibility.fontSize.preview')}
          </p>
        </div>
      </section>

      {/* Audio Speed Controls */}
      <section className="settings-section card">
        <h2>{t('accessibility.audioSpeed.title')}</h2>
        <p className="section-description">
          {t('accessibility.audioSpeed.description')}
        </p>
        <div className="audio-speed-controls">
          {audioSpeedOptions.map((speed) => (
            <button
              key={speed}
              className={`speed-button ${preferences.audioSpeed === speed ? 'active' : ''}`}
              onClick={() => updateAudioSpeed(speed)}
              aria-pressed={preferences.audioSpeed === speed}
            >
              {speed}x
            </button>
          ))}
        </div>
        <div className="speed-slider">
          <input
            type="range"
            min="0.75"
            max="1.5"
            step="0.25"
            value={preferences.audioSpeed}
            onChange={(e) => updateAudioSpeed(parseFloat(e.target.value) as AudioSpeed)}
            aria-label={t('accessibility.audioSpeed.slider')}
          />
          <span className="slider-value">{preferences.audioSpeed}x</span>
        </div>
      </section>

      {/* Contrast Mode Toggle */}
      <section className="settings-section card">
        <h2>{t('accessibility.contrast.title')}</h2>
        <p className="section-description">
          {t('accessibility.contrast.description')}
        </p>
        <label className="toggle-switch">
          <input
            type="checkbox"
            checked={preferences.contrastMode}
            onChange={(e) => updateContrastMode(e.target.checked)}
            aria-label={t('accessibility.contrast.toggle')}
          />
          <span className="toggle-slider"></span>
          <span className="toggle-label">
            {preferences.contrastMode ? t('accessibility.contrast.enabled') : t('accessibility.contrast.disabled')}
          </span>
        </label>
      </section>

      {/* Action Buttons */}
      <div className="settings-actions">
        <button className="button button-primary" onClick={handleSave}>
          {t('accessibility.save')}
        </button>
        <button className="button button-secondary" onClick={handleReset}>
          {t('accessibility.reset')}
        </button>
        {onBack && (
          <button className="button button-secondary" onClick={onBack}>
            {t('app.back')}
          </button>
        )}
      </div>

      {/* Status Messages */}
      {showSaveMessage && (
        <div className="status-message success">
          {t('accessibility.saveSuccess')}
        </div>
      )}
      {showResetMessage && (
        <div className="status-message info">
          {t('accessibility.resetSuccess')}
        </div>
      )}

      {/* Current Settings Summary */}
      <section className="settings-summary card">
        <h3>{t('accessibility.summary.title')}</h3>
        <div className="summary-grid">
          <div className="summary-item">
            <span className="summary-label">{t('accessibility.summary.theme')}:</span>
            <span className="summary-value">{t(`accessibility.theme.${preferences.theme}`)}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">{t('accessibility.summary.fontSize')}:</span>
            <span className="summary-value">{t(`accessibility.fontSize.${preferences.fontSize}`)}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">{t('accessibility.summary.audioSpeed')}:</span>
            <span className="summary-value">{preferences.audioSpeed}x</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">{t('accessibility.summary.contrast')}:</span>
            <span className="summary-value">
              {preferences.contrastMode ? t('accessibility.contrast.enabled') : t('accessibility.contrast.disabled')}
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AccessibilitySettings;
