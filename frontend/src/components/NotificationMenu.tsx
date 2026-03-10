import React, { useState, useEffect, useRef, useCallback } from 'react';
import { auth } from '../firebase';
import { subscribeToConversations, Conversation } from '../services/chatService';
import { Page } from './Navigation';
import './NotificationMenu.css';

// ---- localStorage helpers ------------------------------------------------
const LS_READ_KEY = 'notification_read_ids';
const LS_CLEARED_KEY = 'notification_cleared_ids';

function getStoredIds(key: string): Set<string> {
    try {
        const raw = localStorage.getItem(key);
        return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
    } catch {
        return new Set();
    }
}

function storeIds(key: string, ids: Set<string>) {
    localStorage.setItem(key, JSON.stringify(Array.from(ids)));
}
// -------------------------------------------------------------------------

const NotificationMenu: React.FC<{ onNavigate?: (page: Page) => void }> = ({ onNavigate }) => {
    const [open, setOpen] = useState(false);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    /** IDs the user has explicitly read (persisted) */
    const [readIds, setReadIds] = useState<Set<string>>(() => getStoredIds(LS_READ_KEY));
    /** IDs the user has cleared — won't show in the list at all (persisted) */
    const [clearedIds, setClearedIds] = useState<Set<string>>(() => getStoredIds(LS_CLEARED_KEY));
    const menuRef = useRef<HTMLDivElement | null>(null);

    const currentUser = auth.currentUser;

    // Subscribe to conversations
    useEffect(() => {
        if (!currentUser?.uid) return;
        const unsubscribe = subscribeToConversations(currentUser.uid, (newConversations) => {
            setConversations(newConversations);
        });
        return () => unsubscribe();
    }, [currentUser?.uid, readConversations]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleMouseDown = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleMouseDown);
        return () => document.removeEventListener('mousedown', handleMouseDown);
    }, []);

    // Visible conversations = not cleared
    const visibleConversations = conversations.filter(c => !clearedIds.has(c.id));

    // Unread = has a last message from someone else AND not in readIds
    const isUnread = useCallback(
        (conv: Conversation) =>
            !!conv.lastMessage &&
            conv.lastMessage.senderUid !== currentUser?.uid &&
            !readIds.has(conv.id),
        [readIds, currentUser?.uid]
    );

    const unreadCount = visibleConversations.filter(isUnread).length;

    const markRead = (id: string) => {
        setReadIds(prev => {
            const next = new Set(prev).add(id);
            storeIds(LS_READ_KEY, next);
            return next;
        });
    };

    const handleMarkAllAsRead = (e: React.MouseEvent) => {
        e.stopPropagation();
        const allIds = visibleConversations.map(c => c.id);
        setReadIds(prev => {
            const next = new Set(Array.from(prev).concat(allIds));
            storeIds(LS_READ_KEY, next);
            return next;
        });
    };

    const handleClearAll = (e: React.MouseEvent) => {
        e.stopPropagation();
        const allIds = visibleConversations.map(c => c.id);
        setClearedIds(prev => {
            const next = new Set(Array.from(prev).concat(allIds));
            storeIds(LS_CLEARED_KEY, next);
            return next;
        });
        setReadIds(prev => {
            const next = new Set(Array.from(prev).concat(allIds));
            storeIds(LS_READ_KEY, next);
            return next;
        });
    };

    const handleNotificationClick = (convId?: string) => {
        setOpen(false);
        if (convId) markRead(convId);
        if (onNavigate) onNavigate('collaboration');
    };

    const handleMarkAllAsRead = (e: React.MouseEvent) => {
        e.stopPropagation();
        setReadConversations(new Set(conversations.map(c => c.id)));
        setUnreadCount(0);
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
                onClick={() => setOpen(s => !s)}
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
                    {/* Header */}
                    <div className="notification-header">
                        <span className="notification-title">Notifications</span>
                        {unreadCount > 0 && (
                            <button className="notification-mark-read" onClick={handleMarkAllAsRead}>
                                Mark all as read
                            </button>
                        )}
                    </div>

                    {/* List */}
                    <div className="notification-list">
                        {visibleConversations.length === 0 ? (
                            <div className="notification-empty">No recent messages</div>
                        ) : (
                            visibleConversations.slice(0, 5).map((conv) => (
                                <button
                                    key={conv.id}
                                    className={`notification-item ${isUnread(conv) ? 'unread' : ''}`}
                                    onClick={() => handleNotificationClick(conv.id)}
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

                    {/* Footer */}
                    <div className="notification-footer">
                        <button className="notification-view-all" onClick={() => handleNotificationClick()}>
                            View all in Collaboration
                        </button>
                        {visibleConversations.length > 0 && (
                            <button className="notification-clear-all" onClick={handleClearAll}>
                                Clear all
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationMenu;
