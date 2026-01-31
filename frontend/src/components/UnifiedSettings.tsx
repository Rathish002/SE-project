/**
 * Unified Settings Page
 * Combines Language Settings + Accessibility Settings
 * Single page for all user preferences
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccessibility } from '../contexts/AccessibilityContext';
import {
  getInterfaceLanguage,
  setInterfaceLanguage,
  getLearningDirection,
  setLearningDirection,
  InterfaceLanguage,
  LearningDirection,
} from '../utils/languageManager';
import type { ThemeMode, FontSize, AudioSpeed } from '../types/accessibility';
import './UnifiedSettings.css';

interface UnifiedSettingsProps {
  onBack?: () => void;
}

const UnifiedSettings: React.FC<UnifiedSettingsProps> = ({ onBack }) => {
  const { t, i18n } = useTranslation();
  const {
    preferences,
    updateTheme,
    updateFontSize,
    updateAudioSpeed,
    updateContrastMode,
    saveCurrentPreferences,
    resetToDefaults,
  } = useAccessibility();

  // Language settings state
  const [interfaceLang, setInterfaceLang] = useState<InterfaceLanguage>(getInterfaceLanguage());
  const [learningDir, setLearningDir] = useState<LearningDirection>(getLearningDirection());

  // Accessibility feedback
  const [showSaveMessage, setShowSaveMessage] = useState(false);
  const [showResetMessage, setShowResetMessage] = useState(false);

  // Update i18n language when interface language changes
  useEffect(() => {
    i18n.changeLanguage(interfaceLang);
  }, [interfaceLang, i18n]);

  // Handle interface language change
  const handleInterfaceLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value as InterfaceLanguage;
    setInterfaceLanguage(newLang);
    setInterfaceLang(newLang);
    i18n.changeLanguage(newLang);
  };

  // Handle learning direction change
  const handleLearningDirectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDir = e.target.value as LearningDirection;
    setLearningDirection(newDir);
    setLearningDir(newDir);
  };

  // Handle save
  const handleSave = () => {
    saveCurrentPreferences();
    setShowSaveMessage(true);
    setTimeout(() => setShowSaveMessage(false), 3000);
  };

  // Handle reset
  const handleReset = () => {
    if (window.confirm(t('settings.resetConfirm'))) {
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
    { value: 'small', label: t('accessibility.fontSize.small') },
    { value: 'medium', label: t('accessibility.fontSize.medium') },
    { value: 'large', label: t('accessibility.fontSize.large') },
  ];

  const audioSpeedOptions: AudioSpeed[] = [0.75, 1.0, 1.25, 1.5];

  return (
    <div className="unified-settings">
      <header className="settings-header">
        <h1>{t('settings.title')}</h1>
        <p>{t('settings.subtitle')}</p>
      </header>

      {/* Language Settings Section */}
      <section className="settings-section card">
        <h2>{t('settings.languageSection')}</h2>
        
        <div className="settings-group">
          <label htmlFor="interface-language">
            {t('settings.interfaceLanguage')}
          </label>
          <select
            id="interface-language"
            value={interfaceLang}
            onChange={handleInterfaceLanguageChange}
            className="settings-select"
            aria-label={t('settings.interfaceLanguage')}
          >
            <option value="en">{t('settings.english')}</option>
            <option value="hi">{t('settings.hindi')}</option>
          </select>
        </div>

        <div className="settings-group">
          <label htmlFor="learning-direction">
            {t('settings.learningDirection')}
          </label>
          <select
            id="learning-direction"
            value={learningDir}
            onChange={handleLearningDirectionChange}
            className="settings-select"
            aria-label={t('settings.learningDirection')}
          >
            <option value="hi-to-en">{t('settings.hindiToEnglish')}</option>
            <option value="en-to-hi">{t('settings.englishToHindi')}</option>
          </select>
        </div>

        <div className="learning-info">
          <p>
            {learningDir === 'en-to-hi'
              ? t('settings.learningInfo.enToHi')
              : t('settings.learningInfo.hiToEn')}
          </p>
        </div>
      </section>

      {/* Accessibility Settings Section */}
      <section className="settings-section card">
        <h2>{t('accessibility.title')}</h2>
        <p className="section-description">{t('accessibility.subtitle')}</p>

        {/* Theme Selection */}
        <div className="settings-subsection">
          <h3>{t('accessibility.theme.title')}</h3>
          <p className="section-description">{t('accessibility.theme.description')}</p>
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
        </div>

        {/* Font Size */}
        <div className="settings-subsection">
          <h3>{t('accessibility.fontSize.title')}</h3>
          <p className="section-description">{t('accessibility.fontSize.description')}</p>
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
            <p className="preview-sample">{t('accessibility.fontSize.preview')}</p>
          </div>
        </div>

        {/* Audio Speed */}
        <div className="settings-subsection">
          <h3>{t('accessibility.audioSpeed.title')}</h3>
          <p className="section-description">{t('accessibility.audioSpeed.description')}</p>
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
        </div>

        {/* Contrast Mode */}
        <div className="settings-subsection">
          <h3>{t('accessibility.contrast.title')}</h3>
          <p className="section-description">{t('accessibility.contrast.description')}</p>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={preferences.contrastMode}
              onChange={(e) => updateContrastMode(e.target.checked)}
              aria-label={t('accessibility.contrast.toggle')}
            />
            <span className="toggle-slider"></span>
            <span className="toggle-label">
              {preferences.contrastMode
                ? t('accessibility.contrast.enabled')
                : t('accessibility.contrast.disabled')}
            </span>
          </label>
        </div>

        {/* Distraction-Free Mode */}
        <div className="settings-subsection">
          <h3>{t('accessibility.distractionFree.title')}</h3>
          <p className="section-description">{t('accessibility.distractionFree.description')}</p>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={(() => {
                try {
                  return localStorage.getItem('distraction-free-mode') === '1';
                } catch {
                  return false;
                }
              })()}
              onChange={(e) => {
                try {
                  localStorage.setItem('distraction-free-mode', e.target.checked ? '1' : '0');
                } catch (err) {
                  console.warn('Failed to save distraction-free mode');
                }
              }}
              aria-label={t('accessibility.distractionFree.toggle')}
            />
            <span className="toggle-slider"></span>
            <span className="toggle-label">
              {(() => {
                try {
                  return localStorage.getItem('distraction-free-mode') === '1'
                    ? t('accessibility.distractionFree.enabled')
                    : t('accessibility.distractionFree.disabled');
                } catch {
                  return t('accessibility.distractionFree.disabled');
                }
              })()}
            </span>
          </label>
        </div>
      </section>

      {/* Action Buttons */}
      <div className="settings-actions">
        <button className="button button-primary" onClick={handleSave}>
          {t('settings.save')}
        </button>
        <button className="button button-secondary" onClick={handleReset}>
          {t('settings.reset')}
        </button>
        {onBack && (
          <button className="button button-secondary" onClick={onBack}>
            {t('app.back')}
          </button>
        )}
      </div>

      {/* Status Messages */}
      {showSaveMessage && (
        <div className="status-message success">{t('settings.saveSuccess')}</div>
      )}
      {showResetMessage && (
        <div className="status-message info">{t('settings.resetSuccess')}</div>
      )}
    </div>
  );
};

export default UnifiedSettings;
