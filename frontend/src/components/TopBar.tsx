import React from 'react';
import LanguageSwitcher from './LanguageSwitcher';
import ProfileMenu from './ProfileMenu';
import './TopBar.css';
import { Page } from './Navigation';

interface TopBarProps {
    onToggleSidebar: () => void;
    isSidebarOpen: boolean;
    onLogout: () => void;
    onNavigate: (page: Page) => void;
}

const TopBar: React.FC<TopBarProps> = ({ onToggleSidebar, isSidebarOpen, onLogout, onNavigate }) => {
    return (
        <header className="top-bar">
            <div className="top-bar-left">
                {!isSidebarOpen && (
                    <button
                        className="sidebar-toggle-btn"
                        onClick={onToggleSidebar}
                        aria-label="Open sidebar"
                    >
                        ☰
                    </button>
                )}
            </div>
            <div className="top-bar-right">
                <LanguageSwitcher />
                <ProfileMenu
                    onSignOut={onLogout}
                    onSettings={() => onNavigate('settings')}
                    onProfile={() => onNavigate('home')}
                    isOpen={true}
                />
            </div>
        </header>
    );
};

export default TopBar;
