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

const ProfileMenu: React.FC<{ onSignOut?: () => void; onProfile?: () => void; onSettings?: () => void }> = ({ onSignOut, onProfile, onSettings }) => {
	const [open, setOpen] = useState(false);
	const [avatar, setAvatar] = useState<string | null>(null);
	const fileRef = useRef<HTMLInputElement | null>(null);
	const menuRef = useRef<HTMLDivElement | null>(null);
	const { preferences, updateTheme } = useAccessibility();

	const currentUser = auth.currentUser;
	const username = currentUser ? resolveUsername(currentUser) : '';

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
			// toggle off if same selected
			clearAvatar();
			return;
		}
		setAvatar(key);
		try { localStorage.setItem(STORAGE_KEY, key); } catch (e) {}
	};

	const handleUpload = (file?: File) => {
		const f = file || (fileRef.current && fileRef.current.files && fileRef.current.files[0]);
		if (!f) return;
		const reader = new FileReader();
		reader.onload = () => {
			const data = reader.result as string;
			setAvatar(data);
			try { localStorage.setItem(STORAGE_KEY, data); } catch (e) {}
		};
		reader.readAsDataURL(f);
	};

	const clearAvatar = () => {
		setAvatar(null);
		try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
	};

	const avatarNode = () => {
		if (!avatar) return <div className="avatar-placeholder" aria-hidden />;
		if (avatar.startsWith('gradient:')) {
			const grad = avatar.replace('gradient:', '');
			return <div className="avatar-gradient" style={{ background: grad }} aria-hidden />;
		}
		return <img className="avatar-img" src={avatar} alt="profile" />;
	};

	return (
		<div className="profile-menu" ref={menuRef}>
			<button className="profile-btn" onClick={() => setOpen((s) => !s)} aria-haspopup="true" aria-expanded={open} aria-label="Profile">
				{avatarNode()}
			</button>

			{open && (
				<div className="profile-dropdown" role="menu">
					<button className="dropdown-close" aria-label="Close" onClick={() => setOpen(false)}>✕</button>
					<div className="profile-section">
						<div className="profile-avatar-preview">{avatarNode()}</div>
						{username && <div className="profile-username" aria-label="username">{username}</div>}
						<div className="profile-avatar-actions">
							<div className="defaults">
								{DEFAULT_GRADIENTS.map((g, idx) => {
									const key = `gradient:${g}`;
									const selected = avatar === key;
									return (
										<button key={idx} className={`default-avatar ${selected ? 'selected' : ''}`} style={{ background: g }} onClick={() => pickDefault(g)} aria-label={`Choose avatar ${idx+1}`} />
									);
								})}
								<button className="default-avatar clear" onClick={clearAvatar} aria-label="Clear avatar">✕</button>
							</div>
							<div className="upload-row">
								<input ref={fileRef} type="file" accept="image/*" onChange={() => handleUpload()} />
							</div>
						</div>
					</div>

					<div className="profile-section appearance">
						<div className="appearance-title">Appearance</div>
						<div className="appearance-options">
							<label>
								<input type="radio" name="theme" checked={preferences.theme === 'light'} onChange={() => updateTheme('light')} /> {' '}Light
							</label>
							<label>
								<input type="radio" name="theme" checked={preferences.theme === 'dark'} onChange={() => updateTheme('dark')} /> {' '}Dark
							</label>
							<label>
								<input type="radio" name="theme" checked={preferences.theme === 'high-contrast'} onChange={() => updateTheme('high-contrast')} /> {' '}High Contrast
							</label>
						</div>
					</div>

					<div className="profile-section actions">
						<button className="menu-btn" onClick={() => { setOpen(false); if (onProfile) onProfile(); }}>Profile</button>
						<button className="menu-btn" onClick={() => { setOpen(false); if (onSettings) onSettings(); }}>Settings</button>
						<button className="menu-btn" onClick={() => { setOpen(false); if (onSignOut) onSignOut(); }}>Sign out</button>
					</div>
				</div>
			)}
		</div>
	);
};

export default ProfileMenu;

