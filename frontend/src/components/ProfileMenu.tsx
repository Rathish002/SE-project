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

const ProfileMenu: React.FC<{ onSignOut?: () => void; onProfile?: () => void; onSettings?: () => void; isOpen?: boolean }> = ({ onSignOut, onProfile, onSettings, isOpen = true }) => {
	const [open, setOpen] = useState(false);
	const [avatar, setAvatar] = useState<string | null>(null);
	const fileRef = useRef<HTMLInputElement | null>(null);
	const menuRef = useRef<HTMLDivElement | null>(null);
	const { preferences, updateTheme, updateContrastMode } = useAccessibility();

	const currentUser = auth.currentUser;
	const username = currentUser ? resolveUsername(currentUser) : 'User';
	const email = currentUser?.email || 'user@example.com';

	useEffect(() => {
		try {
			const stored = localStorage.getItem(STORAGE_KEY);
			if (stored) setAvatar(stored);
		} catch (e) {
			// ignore
		}
	}, []);

	useEffect(() => {
		const handleClick = (e: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
				setOpen(false);
			}
		};
		document.addEventListener('click', handleClick);
		return () => document.removeEventListener('click', handleClick);
	}, []);

	const pickDefault = (grad: string) => {
		const key = `gradient:${grad}`;
		if (avatar === key) {
			clearAvatar();
			return;
		}
		setAvatar(key);
		try { localStorage.setItem(STORAGE_KEY, key); } catch (e) { }
	};

	const handleUpload = (file?: File) => {
		const f = file || (fileRef.current && fileRef.current.files && fileRef.current.files[0]);
		if (!f) return;
		const reader = new FileReader();
		reader.onload = () => {
			const data = reader.result as string;
			setAvatar(data);
			try { localStorage.setItem(STORAGE_KEY, data); } catch (e) { }
		};
		reader.readAsDataURL(f);
	};

	const clearAvatar = () => {
		setAvatar(null);
		try { localStorage.removeItem(STORAGE_KEY); } catch (e) { }
	};

	const Avatar = ({ size = 36 }: { size?: number }) => {
		const style = { width: size, height: size };
		if (!avatar) return <div className="avatar-placeholder" style={style} aria-hidden />;
		if (avatar.startsWith('gradient:')) {
			const grad = avatar.replace('gradient:', '');
			return <div className="avatar-gradient" style={{ ...style, background: grad }} aria-hidden />;
		}
		return <img className="avatar-img" style={style} src={avatar} alt="profile" />;
	};

	// Icons
	const IconThemeLight = () => (
		<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
			<circle cx="12" cy="12" r="5"></circle>
			<line x1="12" y1="1" x2="12" y2="3"></line>
			<line x1="12" y1="21" x2="12" y2="23"></line>
			<line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
			<line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
			<line x1="1" y1="12" x2="3" y2="12"></line>
			<line x1="21" y1="12" x2="23" y2="12"></line>
			<line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
			<line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
		</svg>
	);
	const IconThemeDark = () => (
		<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
			<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
		</svg>
	);
	const IconThemeContrast = () => (
		<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
			<circle cx="12" cy="12" r="10"></circle>
			<line x1="12" y1="2" x2="12" y2="22"></line>
			<path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10"></path>
		</svg>
	);
	const IconUser = () => (
		<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
			<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
			<circle cx="12" cy="7" r="4"></circle>
		</svg>
	);
	const IconSettings = () => (
		<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
			<circle cx="12" cy="12" r="3"></circle>
			<path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
		</svg>
	);
	const IconLogOut = () => (
		<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
			<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
			<polyline points="16 17 21 12 16 7"></polyline>
			<line x1="21" y1="12" x2="9" y2="12"></line>
		</svg>
	);

	return (
		<div className="profile-menu" ref={menuRef}>
			<button className="profile-btn" onClick={() => setOpen((s) => !s)} aria-haspopup="true" aria-expanded={open} aria-label="Open profile menu">
				<Avatar size={32} />
			</button>

			{open && (
				<div className="profile-dropdown" role="menu">
					<div className="profile-header">
						<div className="profile-header-user">
							<div className="profile-header-avatar">
								<Avatar size={48} />
								<div className="avatar-edit-overlay" onClick={() => fileRef.current?.click()} role="button" aria-label="Change avatar">
									<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
								</div>
							</div>
							<div className="profile-header-info">
								<div className="profile-name">{username}</div>
								<div className="profile-email">{email}</div>
							</div>
						</div>

						<div className="profile-avatar-selector">
							{DEFAULT_GRADIENTS.map((g, idx) => (
								<button
									key={idx}
									className={`avatar-choice ${avatar === `gradient:${g}` ? 'selected' : ''}`}
									style={{ background: g }}
									onClick={() => pickDefault(g)}
									aria-label={`Gradient avatar ${idx + 1}`}
								/>
							))}
							<button className="avatar-choice clear" onClick={clearAvatar} aria-label="Reset avatar">✕</button>
							<input ref={fileRef} type="file" accept="image/*" onChange={() => handleUpload()} style={{ display: 'none' }} />
						</div>
					</div>

					<div className="profile-divider" />

					<div className="profile-section">
						<div className="section-title">Appearance</div>
						<div className="theme-toggle-group" role="radiogroup" aria-label="Theme selection">
							<button
								className={`theme-btn ${preferences.theme === 'light' ? 'active' : ''}`}
								onClick={() => { updateTheme('light'); updateContrastMode(false); }}
								role="radio"
								aria-checked={preferences.theme === 'light'}
								aria-label="Light theme"
							>
								<IconThemeLight />
								<span>Light</span>
							</button>
							<button
								className={`theme-btn ${preferences.theme === 'dark' ? 'active' : ''}`}
								onClick={() => { updateTheme('dark'); updateContrastMode(false); }}
								role="radio"
								aria-checked={preferences.theme === 'dark'}
								aria-label="Dark theme"
							>
								<IconThemeDark />
								<span>Dark</span>
							</button>
							<button
								className={`theme-btn ${preferences.theme === 'high-contrast' ? 'active' : ''}`}
								onClick={() => { updateTheme('high-contrast'); updateContrastMode(true); }}
								role="radio"
								aria-checked={preferences.theme === 'high-contrast'}
								aria-label="High contrast theme"
							>
								<IconThemeContrast />
								<span>Contrast</span>
							</button>
						</div>
					</div>

					<div className="profile-divider" />

					<div className="profile-section menu-items">
						<button className="menu-item" onClick={() => { setOpen(false); onProfile?.(); }}>
							<IconUser />
							<span>Your Profile</span>
						</button>
						<button className="menu-item" onClick={() => { setOpen(false); onSettings?.(); }}>
							<IconSettings />
							<span>Settings</span>
						</button>
						<button className="menu-item danger" onClick={() => { setOpen(false); onSignOut?.(); }}>
							<IconLogOut />
							<span>Sign out</span>
						</button>
					</div>
				</div>
			)}
		</div>
	);
};

export default ProfileMenu;
