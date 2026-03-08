import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { auth } from '../firebase';
import { subscribeToConversations, Conversation } from '../services/chatService';
import { Page } from './Navigation';
import './NotificationMenu.css';

const NotificationMenu: React.FC<{ onNavigate?: (page: Page) => void }> = ({ onNavigate }) => {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const menuRef = useRef<HTMLDivElement | null>(null);

    const currentUser = auth.currentUser;

    useEffect(() => {
        if (!currentUser?.uid) return;

        const unsubscribe = subscribeToConversations(currentUser.uid, (newConversations) => {
            setConversations(newConversations);
            
            // For now, let's just count conversations that have a lastMessage 
            // from someone other than the current user as "unread" for the notification badge
            // In a real app, this would use a proper read receipt system
            const count = newConversations.filter(
                (conv) => conv.lastMessage && conv.lastMessage.senderUid !== currentUser.uid
            ).length;
            setUnreadCount(count);
        });

        return () => unsubscribe();
    }, [currentUser?.uid]);

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('click', handleClick);
        return () => document.removeEventListener('click', handleClick);
    }, []);

    const handleNotificationClick = () => {
        setOpen(false);
        if (onNavigate) {
            onNavigate('collaboration');
        }
    };

    const formatTimestamp = (timestamp?: any) => {
        if (!timestamp) return '';
        const date = timestamp.toDate ? timestamp.toDate() : new Date();
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const IconBell = () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
    );

    return (
        <div className="notification-menu" ref={menuRef}>
            <button 
                className={`notification-btn ${open ? 'active' : ''}`} 
                onClick={() => setOpen((s) => !s)} 
                aria-haspopup="true" 
                aria-expanded={open} 
                aria-label="Open notifications"
            >
                <IconBell />
                {unreadCount > 0 && (
                    <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
                )}
            </button>

            {open && (
                <div className="notification-dropdown" role="menu">
                    <div className="notification-header">
                        <div className="notification-title">Notifications</div>
                    </div>
                    
                    <div className="notification-list">
                        {conversations.length === 0 ? (
                            <div className="notification-empty">
                                No recent messages
                            </div>
                        ) : (
                            conversations.slice(0, 5).map((conv) => (
                                <button 
                                    key={conv.id} 
                                    className="notification-item" 
                                    onClick={handleNotificationClick}
                                    role="menuitem"
                                >
                                    <div className="notification-item-avatar">
                                        <div className="avatar-placeholder" aria-hidden="true" />
                                    </div>
                                    <div className="notification-item-content">
                                        <div className="notification-item-header">
                                            <span className="notification-item-name">
                                                {conv.type === 'group' 
                                                    ? conv.groupName || 'Group Chat' 
                                                    : conv.participantNames.find(name => name !== auth.currentUser?.displayName) || 'User'}
                                            </span>
                                            <span className="notification-item-time">
                                                {formatTimestamp(conv.lastMessage?.timestamp)}
                                            </span>
                                        </div>
                                        {conv.lastMessage && (
                                            <div className="notification-item-text">
                                                {conv.lastMessage.senderUid === currentUser?.uid ? 'You: ' : ''}
                                                {conv.lastMessage.text || (conv.lastMessage.type === 'image' ? 'Sent an image' : 'Message')}
                                            </div>
                                        )}
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                    
                    <div className="notification-footer">
                        <button className="notification-view-all" onClick={handleNotificationClick}>
                            View all in Collaboration
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationMenu;
