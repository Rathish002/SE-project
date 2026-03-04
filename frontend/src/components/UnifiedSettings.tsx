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
import { getUserProfile, updateUserName, changePassword, changeUsername, deleteUserAccount } from '../services/userService';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { auth } from '../firebase';
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
    updateDistractionFreeMode,
    updateReducedMotion,
    updateDyslexiaFont,
    updateBlueLightFilter,
    updateReadingMask,
    saveCurrentPreferences,
    resetToDefaults,
  } = useAccessibility();

  // Language settings state
  const [interfaceLang, setInterfaceLang] = useState<InterfaceLanguage>(getInterfaceLanguage());
  const [learningDir, setLearningDir] = useState<LearningDirection>(getLearningDirection());

  // Accessibility feedback
  const [showSaveMessage, setShowSaveMessage] = useState(false);
  const [showResetMessage, setShowResetMessage] = useState(false);
  const [username, setUsername] = useState<string>('');
  const [uid, setUid] = useState<string | null>(null);
  const [email, setEmail] = useState<string>('');

  // Password change modal
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Username change modal
  const [showChangeUsername, setShowChangeUsername] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [usernamePassword, setUsernamePassword] = useState('');
  const [usernameMessage, setUsernameMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [usernameLoading, setUsernameLoading] = useState(false);

  // Delete account modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteMessage, setDeleteMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

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
    // Save username if changed
    if (uid) {
      updateUserName(uid, username).catch((e) => console.warn('Failed to update username', e));
    }
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

  // Handle change password
  const handleChangePassword = async () => {
    if (!newPassword || !currentPassword) {
      setPasswordMessage({ type: 'error', text: 'Please fill in all password fields' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }

    try {
      setPasswordLoading(true);
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('User not logged in');

      await changePassword(currentUser, currentPassword, newPassword);
      setPasswordMessage({ type: 'success', text: 'Password changed successfully' });

      // Reset form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setShowChangePassword(false);
        setPasswordMessage(null);
      }, 2000);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to change password';
      setPasswordMessage({ type: 'error', text: message });
    } finally {
      setPasswordLoading(false);
    }
  };

  // Handle change username
  const handleChangeUsername = async () => {
    if (!newUsername || !usernamePassword) {
      setUsernameMessage({ type: 'error', text: 'Please fill in all fields' });
      return;
    }

    try {
      setUsernameLoading(true);
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('User not logged in');

      await changeUsername(currentUser, usernamePassword, newUsername);
      setUsernameMessage({ type: 'success', text: 'Username changed successfully' });

      // Update local state
      setUsername(newUsername.trim());

      // Reset form
      setNewUsername('');
      setUsernamePassword('');
      setTimeout(() => {
        setShowChangeUsername(false);
        setUsernameMessage(null);
      }, 2000);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to change username';
      setUsernameMessage({ type: 'error', text: message });
    } finally {
      setUsernameLoading(false);
    }
  };

  // Handle delete account
  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE' || !deletePassword) {
      setDeleteMessage({ type: 'error', text: 'Please confirm deletion and enter your password' });
      return;
    }

    try {
      setDeleteLoading(true);
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('User not logged in');

      await deleteUserAccount(currentUser, deletePassword);

      // Redirect to login after successful deletion
      await signOut(auth);
      window.location.href = '/';
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete account';
      setDeleteMessage({ type: 'error', text: message });
      setDeleteLoading(false);
    }
  };

  // Load current user's profile for username editing
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      if (user) {
        setUid(user.uid);
        setEmail(user.email || '');
        try {
          const profile = await getUserProfile(user.uid);
          setUsername(profile?.name || '');
        } catch (e) {
          console.warn('Failed to load user profile', e);
        }
      } else {
        setUid(null);
        setUsername('');
        setEmail('');
      }
    });

    return () => unsubscribe();
  }, []);

  const themeOptions: { value: ThemeMode; label: string; icon: string }[] = [
    { value: 'light', label: t('accessibility.theme.light'), icon: '☀️' },
    { value: 'dark', label: t('accessibility.theme.dark'), icon: '🌙' },
  ];


  const audioSpeedOptions: AudioSpeed[] = [0.75, 1.0, 1.25, 1.5];

  return (
    <div className="unified-settings">
      <header className="settings-header">
        <h1>{t('settings.title')}</h1>
        <p>{t('settings.subtitle')}</p>
      </header>

      {/* Username Editing */}
      <section className="settings-section card">
        <h2><span className="section-icon">👤</span> {t('settings.profileSection', 'Profile')}</h2>
        <div className="settings-group">
          <label htmlFor="username">{t('settings.username', 'Username')}</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="settings-input"
            placeholder={t('settings.usernamePlaceholder')}
            aria-label={t('settings.username')}
            disabled={!uid}
          />
          {!uid && <p className="settings-note">{t('settings.loginToEdit')}</p>}
        </div>

        {/* Change Username */}
        {uid && (
          <div className="settings-subsection">
            <h3>Change Username</h3>
            <button
              className="button button-secondary"
              onClick={() => setShowChangeUsername(!showChangeUsername)}
            >
              {showChangeUsername ? 'Cancel' : 'Change Username'}
            </button>

            {showChangeUsername && (
              <div className="modal-form">
                <div className="settings-group">
                  <label htmlFor="new-username">New Username</label>
                  <input
                    id="new-username"
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="settings-input"
                    placeholder="Enter new username"
                    disabled={usernameLoading}
                  />
                </div>

                <div className="settings-group">
                  <label htmlFor="username-password">Confirm Password</label>
                  <input
                    id="username-password"
                    type="password"
                    value={usernamePassword}
                    onChange={(e) => setUsernamePassword(e.target.value)}
                    className="settings-input"
                    placeholder="Enter your password to confirm"
                    disabled={usernameLoading}
                  />
                </div>

                <button
                  className="button button-primary"
                  onClick={handleChangeUsername}
                  disabled={usernameLoading}
                >
                  {usernameLoading ? 'Updating...' : 'Update Username'}
                </button>

                {usernameMessage && (
                  <div className={`status-message ${usernameMessage.type}`}>
                    {usernameMessage.text}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </section>

      {/* Language Settings Section */}
      <section className="settings-section card">
        <h2><span className="section-icon">🌐</span> {t('settings.languageSection')}</h2>

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
        <h2><span className="section-icon">♿</span> {t('accessibility.title')}</h2>
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
            <div className="slider-container">
              <input
                type="range"
                min="12"
                max="24"
                step="1"
                value={preferences.fontSize}
                onChange={(e) => updateFontSize(Number(e.target.value))}
                className="settings-slider"
                aria-label={t('accessibility.fontSize.slider')}
              />
              <span className="slider-value">{preferences.fontSize}px</span>
            </div>
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
              checked={preferences.distractionFreeMode}
              onChange={(e) => updateDistractionFreeMode(e.target.checked)}
              aria-label={t('accessibility.distractionFree.toggle')}
            />
            <span className="toggle-slider"></span>
            <span className="toggle-label">
              {preferences.distractionFreeMode
                ? t('accessibility.distractionFree.enabled')
                : t('accessibility.distractionFree.disabled')}
            </span>
          </label>
        </div>

        {/* Cognitive & Visual Support */}
        <div className="settings-subsection">
          <h3>{t('accessibility.cognitive.title', 'Cognitive & Visual Support')}</h3>
          <p className="section-description">{t('accessibility.cognitive.description', 'Advanced tools for visual comfort and focus')}</p>

          <div className="cognitive-grid">
            <div className="settings-group">
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={preferences.reducedMotion}
                  onChange={(e) => updateReducedMotion(e.target.checked)}
                  aria-label={t('accessibility.reducedMotion.toggle', 'Reduced Motion')}
                />
                <span className="toggle-slider"></span>
                <span className="toggle-label">
                  {t('accessibility.reducedMotion.label', 'Reduced Motion')}
                </span>
              </label>
            </div>

            <div className="settings-group">
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={preferences.dyslexiaFont}
                  onChange={(e) => updateDyslexiaFont(e.target.checked)}
                  aria-label={t('accessibility.dyslexiaFont.toggle', 'Dyslexia Friendly Font')}
                />
                <span className="toggle-slider"></span>
                <span className="toggle-label">
                  {t('accessibility.dyslexiaFont.label', 'Dyslexia Friendly Font')}
                </span>
              </label>
            </div>

            <div className="settings-group">
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={preferences.blueLightFilter}
                  onChange={(e) => updateBlueLightFilter(e.target.checked)}
                  aria-label={t('accessibility.blueLightFilter.toggle', 'Blue Light Filter')}
                />
                <span className="toggle-slider"></span>
                <span className="toggle-label">
                  {t('accessibility.blueLightFilter.label', 'Blue Light Filter')}
                </span>
              </label>
            </div>

            <div className="settings-group">
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={preferences.readingMask}
                  onChange={(e) => updateReadingMask(e.target.checked)}
                  aria-label={t('accessibility.readingMask.toggle', 'Reading Line Mask')}
                />
                <span className="toggle-slider"></span>
                <span className="toggle-label">
                  {t('accessibility.readingMask.label', 'Reading Line Mask')}
                </span>
              </label>
            </div>
          </div>
        </div>
      </section>

      {/* Account Security Section */}
      <section className="settings-section card">
        <h2><span className="section-icon">🔒</span> Account & Security</h2>
        <p className="section-description">Manage your account security and preferences</p>

        <div className="settings-subsection">
          <h3>Email</h3>
          <p className="section-description">{email || 'Not signed in'}</p>
        </div>

        {/* Change Password */}
        <div className="settings-subsection">
          <h3>Change Password</h3>
          <button
            className="button button-secondary"
            onClick={() => setShowChangePassword(!showChangePassword)}
          >
            {showChangePassword ? 'Cancel' : 'Change Password'}
          </button>

          {showChangePassword && (
            <div className="modal-form">
              <div className="settings-group">
                <label htmlFor="current-password">Current Password</label>
                <input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="settings-input"
                  placeholder="Enter your current password"
                  disabled={passwordLoading}
                />
              </div>

              <div className="settings-group">
                <label htmlFor="new-password">New Password</label>
                <input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="settings-input"
                  placeholder="Enter new password (min 6 characters)"
                  disabled={passwordLoading}
                />
              </div>

              <div className="settings-group">
                <label htmlFor="confirm-password">Confirm New Password</label>
                <input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="settings-input"
                  placeholder="Confirm new password"
                  disabled={passwordLoading}
                />
              </div>

              <button
                className="button button-primary"
                onClick={handleChangePassword}
                disabled={passwordLoading}
              >
                {passwordLoading ? 'Updating...' : 'Update Password'}
              </button>

              {passwordMessage && (
                <div className={`status-message ${passwordMessage.type}`}>
                  {passwordMessage.text}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Delete Account */}
        <div className="settings-subsection danger-zone">
          <h3 style={{ color: '#d32f2f' }}>Delete Account</h3>
          <p className="section-description" style={{ color: '#d32f2f' }}>
            This action cannot be undone. All your data will be permanently deleted.
          </p>
          <button
            className="button button-danger"
            onClick={() => setShowDeleteModal(!showDeleteModal)}
            style={{
              backgroundColor: '#d32f2f',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            {showDeleteModal ? 'Cancel' : 'Delete Account'}
          </button>

          {showDeleteModal && (
            <div className="modal-form danger-form">
              <p style={{ marginBottom: '15px', color: '#d32f2f', fontWeight: 'bold' }}>
                ⚠️ Warning: This will permanently delete your account and all associated data.
              </p>

              <div className="settings-group">
                <label htmlFor="confirm-delete">
                  Type "DELETE" to confirm:
                </label>
                <input
                  id="confirm-delete"
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value.toUpperCase())}
                  className="settings-input"
                  placeholder="Type DELETE"
                  disabled={deleteLoading}
                />
              </div>

              <div className="settings-group">
                <label htmlFor="delete-password">Enter your password to confirm:</label>
                <input
                  id="delete-password"
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  className="settings-input"
                  placeholder="Enter password"
                  disabled={deleteLoading}
                />
              </div>

              <button
                className="button button-danger"
                onClick={handleDeleteAccount}
                disabled={deleteLoading || deleteConfirmText !== 'DELETE' || !deletePassword}
                style={{
                  backgroundColor: '#d32f2f',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '4px',
                  cursor: deleteLoading || deleteConfirmText !== 'DELETE' ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold',
                  opacity: deleteLoading || deleteConfirmText !== 'DELETE' ? 0.6 : 1,
                }}
              >
                {deleteLoading ? 'Deleting...' : 'Permanently Delete My Account'}
              </button>

              {deleteMessage && (
                <div className={`status-message ${deleteMessage.type}`}>
                  {deleteMessage.text}
                </div>
              )}
            </div>
          )}
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
