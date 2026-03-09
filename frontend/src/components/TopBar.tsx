import React from 'react';
import LanguageSwitcher from './LanguageSwitcher';
import NotificationMenu from './NotificationMenu';
import ProfileMenu from './ProfileMenu';
import PageNavArrows from './PageNavArrows';
import './TopBar.css';
import { Page } from './Navigation';

interface TopBarProps {
    onToggleSidebar: () => void;
    isSidebarOpen: boolean;
    onLogout: () => void;
    onNavigate: (page: Page) => void;
    onNavigateToChat?: (conversationId: string) => void;
    currentPage: Page;
}

const TopBar: React.FC<TopBarProps> = ({ onToggleSidebar, isSidebarOpen, onLogout, onNavigate, onNavigateToChat, currentPage }) => {
    return (
        <header className="top-bar">
            <div className="top-bar-left">
                {/* Hamburger toggle removed per user request */}
            </div>
            <div className="top-bar-right">
                <PageNavArrows currentPage={currentPage} onNavigate={onNavigate} />
                <LanguageSwitcher />
                <NotificationMenu onNavigate={onNavigate} onNavigateToChat={onNavigateToChat} />
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
