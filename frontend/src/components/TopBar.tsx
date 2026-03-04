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
                {/* Hamburger toggle removed per user request */}
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
