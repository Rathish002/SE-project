import React, { useState, useRef, useEffect } from 'react';
import './ProfileMenu.css';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { auth } from '../firebase';
import { resolveUsername } from '../services/userService';

const DEFAULT_GRADIENTS = [
  'linear-gradient(135deg,#ff9a9e 0%,#fad0c4 100%)',
  'linear-gradient(135deg,#a18cd1 0%,#fbc2eb 100%)',
  'linear-gradient(135deg,#84fab0 0%,#8fd3f4 100%)',
  'linear-gradient(135deg,#fccb90 0%,#d57eeb 100%)',
  'linear-gradient(135deg,#f6d365 0%,#fda085 100%)',
];

const STORAGE_KEY = 'se_profile_avatar';

type Props = {
  onSignOut?: () => void;
  onProfile?: () => void;
  onSettings?: () => void;
};

const ProfileMenu: React.FC<Props> = ({ onSignOut, onProfile, onSettings }) => {
  const [open, setOpen] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const { preferences, updateTheme } = useAccessibility();

  const currentUser = auth.currentUser;
  const username = currentUser ? resolveUsername(currentUser) : '';

  /* Load avatar from storage */
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setAvatar(stored);
  }, []);

  /* Close dropdown when clicking outside */
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const clearAvatar = () => {
    setAvatar(null);
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) { }
  };

  const pickDefault = (grad: string) => {
    const key = `gradient:${grad}`;
    if (avatar === key) {
      // toggle off if same selected
      clearAvatar();
      return;
    }
    setAvatar(key);
    try { localStorage.setItem(STORAGE_KEY, key); } catch (e) { }
  };

  const handleUpload = (file?: File) => {
    // Support both direct file (drag/drop) or ref (input change)
    const f = file || (fileRef.current?.files?.[0]);
    if (!f) return;

    const reader = new FileReader();
    reader.onload = () => {
      const data = reader.result as string;
      setAvatar(data);
      try { localStorage.setItem(STORAGE_KEY, data); } catch (e) { }
    };
    reader.readAsDataURL(f);
  };

  const renderAvatar = () => {
    if (!avatar) return <div className="avatar-placeholder" />;
    if (avatar.startsWith('gradient:')) {
      const grad = avatar.replace('gradient:', '');
      return <div className="avatar-gradient" style={{ background: grad }} />;
    }
    return <img className="avatar-img" src={avatar} alt="avatar" />;
  };

  return (
    <div className="profile-menu" ref={menuRef}>
      {/* Avatar button */}
      <button
        className="profile-btn"
        onClick={() => setOpen((s) => !s)}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label="Profile menu"
      >
        {renderAvatar()}
      </button>

      {open && (
        <div className="profile-dropdown">

          {/* HEADER */}
          <div className="profile-header">
            <div className="profile-avatar-preview">{renderAvatar()}</div>
            {username && <div className="profile-username">{username}</div>}
          </div>

          {/* AVATAR OPTIONS */}
          <div className="profile-avatar-actions">
            <div className="defaults">
              {DEFAULT_GRADIENTS.map((g, i) => (
                <button
                  key={i}
                  className={`default-avatar ${avatar === `gradient:${g}` ? 'selected' : ''}`}
                  style={{ background: g }}
                  onClick={() => pickDefault(g)}
                  aria-label={`Avatar option ${i + 1}`}
                />
              ))}
              <button
                className="default-avatar clear"
                onClick={clearAvatar}
                aria-label="Clear avatar"
              >
                ✕
              </button>
            </div>

            <div className="upload-row">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={() => handleUpload()}
              />
            </div>
          </div>

          {/* APPEARANCE */}
          <div className="profile-appearance">
            <div className="appearance-title">Appearance</div>

            <div className="appearance-options">
              <label>
                <input
                  type="radio"
                  name="theme"
                  checked={preferences.theme === 'light'}
                  onChange={() => updateTheme('light')}
                />
                Light
              </label>

              <label>
                <input
                  type="radio"
                  name="theme"
                  checked={preferences.theme === 'dark'}
                  onChange={() => updateTheme('dark')}
                />
                Dark
              </label>

              <label>
                <input
                  type="radio"
                  name="theme"
                  checked={preferences.theme === 'high-contrast'}
                  onChange={() => updateTheme('high-contrast')}
                />
                High Contrast
              </label>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="profile-actions">
            <button className="menu-btn" onClick={() => onProfile?.()}>
              Profile
            </button>

            <button className="menu-btn" onClick={() => onSettings?.()}>
              Settings
            </button>

            <button className="menu-btn signout" onClick={() => onSignOut?.()}>
              Sign out
            </button>
          </div>

        </div>
      )}
    </div>
  );
};

export default ProfileMenu;

