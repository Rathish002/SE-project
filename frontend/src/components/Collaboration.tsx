/**
 * Collaboration Landing Page Component
 * Main collaboration hub with friend management and conversations
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { User } from 'firebase/auth';
import FriendSearch from './FriendSearch';
import FriendList from './FriendList';
import FriendRequests from './FriendRequests';
import ChatUI from './ChatUI';
import GroupChatCreate from './GroupChatCreate';
import {
  subscribeToFriends,
  subscribeToFriendRequests,
  type Friend,
  type FriendRequest,
} from '../services/friendService';
import {
  subscribeToConversations,
  getOrCreateDirectConversation,
  clearChatForUser,
  deleteConversation,
  type Conversation,
} from '../services/chatService';
import { saveActivity } from '../utils/activityTracker';
import './Collaboration.css';

interface CollaborationProps {
  currentUser: User | null;
  focusMode: boolean;
  onFocusModeChange: (enabled: boolean) => void;
  initialConversationId?: string | null;
}

const Collaboration: React.FC<CollaborationProps> = ({ currentUser, focusMode, onFocusModeChange, initialConversationId }) => {
  const { t } = useTranslation();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showGroupCreate, setShowGroupCreate] = useState(false);
  const [hiddenConversations, setHiddenConversations] = useState<Set<string>>(new Set());
  const [sidebarTab, setSidebarTab] = useState<'chats' | 'groups' | 'archived' | 'unread' | 'favorites' | 'friends'>('chats');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [pinned, setPinned] = useState<Set<string>>(new Set());
  const [muted, setMuted] = useState<Map<string, number>>(new Map()); // id -> expiry timestamp
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Sorting logic for conversations
  const sortedConversations = useMemo(() => {
    return [...conversations].sort((a, b) => {
      const aPinned = pinned.has(a.id);
      const bPinned = pinned.has(b.id);
      if (aPinned && !bPinned) return -1;
      if (!aPinned && bPinned) return 1;
      
      const aTime = a.updatedAt?.toMillis?.() || 0;
      const bTime = b.updatedAt?.toMillis?.() || 0;
      return bTime - aTime;
    });
  }, [conversations, pinned]);

  // Sync activeConversationId with initialConversationId prop (from notifications)
  useEffect(() => {
    if (initialConversationId) {
      setActiveConversationId(initialConversationId);
      setSidebarTab('chats');
    }
  }, [initialConversationId]);

  // Load hidden and favorite conversations from localStorage
  useEffect(() => {
    if (!currentUser?.uid) return;
    const hiddenKey = `hiddenConversations_${currentUser.uid}`;
    const favoriteKey = `favoriteConversations_${currentUser.uid}`;
    
    const storedHidden = localStorage.getItem(hiddenKey);
    if (storedHidden) {
      try {
        setHiddenConversations(new Set(JSON.parse(storedHidden)));
      } catch (e) {
        console.error('Failed to parse hidden conversations:', e);
      }
    }

    const storedFavorites = localStorage.getItem(favoriteKey);
    if (storedFavorites) {
      try {
        setFavorites(new Set(JSON.parse(storedFavorites)));
      } catch (e) {
        console.error('Failed to parse favorite conversations:', e);
      }
    }

    // Shared with NotificationMenu.tsx
    const storedRead = localStorage.getItem('notification_read_ids');
    if (storedRead) {
      try {
        setReadIds(new Set(JSON.parse(storedRead)));
      } catch (e) {
        console.error('Failed to parse read IDs:', e);
      }
    }

    const storedPinned = localStorage.getItem(`pinnedConversations_${currentUser.uid}`);
    if (storedPinned) {
      try {
        setPinned(new Set(JSON.parse(storedPinned)));
      } catch (e) {
        console.error('Failed to parse pinned conversations:', e);
      }
    }

    const storedMuted = localStorage.getItem(`mutedConversations_${currentUser.uid}`);
    if (storedMuted) {
      try {
        setMuted(new Map(JSON.parse(storedMuted)));
      } catch (e) {
        console.error('Failed to parse muted conversations:', e);
      }
    }
  }, [currentUser?.uid]);

  // Handle Fullscreen for Focus Mode
  useEffect(() => {
    if (focusMode) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch((err) => {
          console.error(`Error attempting to exit fullscreen: ${err.message}`);
        });
      }
    }
  }, [focusMode]);

  // Handle ESC key to exit focus mode
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && focusMode) {
        onFocusModeChange(false);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [focusMode, onFocusModeChange]);

  // Subscribe to friends
  useEffect(() => {
    if (!currentUser?.uid) return;
    const unsubscribe = subscribeToFriends(currentUser.uid, (newFriends) => {
      setFriends(newFriends);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser?.uid]);

  // Subscribe to friend requests
  useEffect(() => {
    if (!currentUser?.uid) return;
    const unsubscribe = subscribeToFriendRequests(currentUser.uid, (requests) => {
      setFriendRequests(requests);
    });

    return () => unsubscribe();
  }, [currentUser?.uid]);

  // Subscribe to conversations
  useEffect(() => {
    if (!currentUser?.uid) return;
    const unsubscribe = subscribeToConversations(currentUser.uid, (newConversations) => {
      setConversations(newConversations);
    });

    return () => unsubscribe();
  }, [currentUser?.uid]);

  const handleStartChat = async (friendUid: string) => {
    try {
      if (!currentUser?.uid) return;
      const conversationId = await getOrCreateDirectConversation(currentUser.uid, friendUid);
      setActiveConversationId(conversationId);
      setSidebarTab('chats');

      const friend = friends.find(f => f.uid === friendUid);
      saveActivity({
        lastConversationId: conversationId,
        lastConversationName: friend?.name || 'Chat',
        lastFriendUid: friendUid,
        lastFriendName: friend?.name,
      });
      // update lastActive on user action
      try {
        const { updateLastActive } = await import('../services/presenceService');
        if (currentUser?.uid) await updateLastActive(currentUser.uid);
      } catch (e) {
        // ignore presence update failures
      }
    } catch (error: any) {
      console.error('Error starting chat:', error);
      alert(t('collaboration.chat.startError'));
    }
  };

  const handleOpenConversation = (conversationId: string) => {
    setActiveConversationId(conversationId);
    
    // Mark as read when opened (consistency with Notifications)
    const newReadIds = new Set(readIds);
    if (!newReadIds.has(conversationId)) {
      newReadIds.add(conversationId);
      setReadIds(newReadIds);
      localStorage.setItem('notification_read_ids', JSON.stringify(Array.from(newReadIds)));
    }

    const conversation = conversations.find(c => c.id === conversationId);
    saveActivity({
      lastConversationId: conversationId,
      lastConversationName: conversation?.participantNames.join(', ') || 'Chat',
    });
  };

  const handleBackToLanding = () => {
    setActiveConversationId(null);
  };

  const handleHideConversation = (conversationId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (!currentUser?.uid) return;

    const newHidden = new Set(hiddenConversations);
    newHidden.add(conversationId);
    setHiddenConversations(newHidden);

    // Save to localStorage
    const storageKey = `hiddenConversations_${currentUser.uid}`;
    localStorage.setItem(storageKey, JSON.stringify(Array.from(newHidden)));
  };

  const handleUnhideConversation = (conversationId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (!currentUser?.uid) return;

    const newHidden = new Set(hiddenConversations);
    newHidden.delete(conversationId);
    setHiddenConversations(newHidden);

    // Save to localStorage
    const storageKey = `hiddenConversations_${currentUser?.uid}`;
    localStorage.setItem(storageKey, JSON.stringify(Array.from(newHidden)));
  };

  const handleToggleFavorite = (conversationId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (!currentUser?.uid) return;

    const newFavorites = new Set(favorites);
    if (newFavorites.has(conversationId)) {
      newFavorites.delete(conversationId);
    } else {
      newFavorites.add(conversationId);
    }
    setFavorites(newFavorites);

    const storageKey = `favoriteConversations_${currentUser?.uid}`;
    localStorage.setItem(storageKey, JSON.stringify(Array.from(newFavorites)));
  };

  const handleTogglePin = (conversationId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const newPinned = new Set(pinned);
    if (newPinned.has(conversationId)) {
      newPinned.delete(conversationId);
    } else {
      newPinned.add(conversationId);
    }
    setPinned(newPinned);
    localStorage.setItem(`pinnedConversations_${currentUser?.uid}`, JSON.stringify(Array.from(newPinned)));
    setActiveMenuId(null);
  };

  const handleMute = (conversationId: string, durationHours: number | null, event: React.MouseEvent) => {
    event.stopPropagation();
    const newMuted = new Map(muted);
    if (durationHours === null) {
      newMuted.delete(conversationId);
    } else if (durationHours === -1) {
      // Permanent
      newMuted.set(conversationId, Number.MAX_SAFE_INTEGER);
    } else {
      const expiry = Date.now() + durationHours * 60 * 60 * 1000;
      newMuted.set(conversationId, expiry);
    }
    setMuted(newMuted);
    localStorage.setItem(`mutedConversations_${currentUser?.uid}`, JSON.stringify(Array.from(newMuted.entries())));
    setActiveMenuId(null);
  };

  const handleToggleUnread = (conversationId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const newReadIds = new Set(readIds);
    if (newReadIds.has(conversationId)) {
      newReadIds.delete(conversationId);
    } else {
      newReadIds.add(conversationId);
    }
    setReadIds(newReadIds);
    localStorage.setItem('notification_read_ids', JSON.stringify(Array.from(newReadIds)));
    setActiveMenuId(null);
  };

  const handleClearChat = async (conversationId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (!currentUser) return;
    if (window.confirm(t('collaboration.chat.confirmClear', 'Are you sure you want to clear this chat? Message history will be hidden for you.'))) {
      try {
        await clearChatForUser(conversationId, currentUser.uid);
        setActiveMenuId(null);
      } catch (error) {
        console.error('Error clearing chat:', error);
      }
    }
  };

  const handleDeleteChat = async (conversationId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (window.confirm(t('collaboration.chat.confirmDelete', 'Are you sure you want to delete this chat permanently for everyone?'))) {
      try {
        await deleteConversation(conversationId);
        setActiveMenuId(null);
      } catch (error) {
        console.error('Error deleting chat:', error);
      }
    }
  };

  const renderContextMenu = (conversation: Conversation) => {
    if (activeMenuId !== conversation.id) return null;

    const isPinned = pinned.has(conversation.id);
    const isMuted = muted.has(conversation.id);
    const isFavorite = favorites.has(conversation.id);
    const isArchived = hiddenConversations.has(conversation.id);
    const isUnread = !readIds.has(conversation.id) && 
                     !!conversation.lastMessage && 
                     conversation.lastMessage.senderUid !== currentUser!.uid;

    return (
      <div className="card-context-menu" onClick={(e) => e.stopPropagation()}>
        <button className="menu-item" onClick={(e) => handleTogglePin(conversation.id, e)}>
          {isPinned ? '📌 ' + t('collaboration.menu.unpin', 'Unpin') : '📍 ' + t('collaboration.menu.pin', 'Pin Chat')}
        </button>
        <button className="menu-item" onClick={(e) => handleToggleFavorite(conversation.id, e)}>
          {isFavorite ? '⭐ ' + t('collaboration.menu.removeFavorite', 'Remove Favorite') : '☆ ' + t('collaboration.menu.addFavorite', 'Add to Favorites')}
        </button>
        <button className="menu-item" onClick={(e) => isArchived ? handleUnhideConversation(conversation.id, e) : handleHideConversation(conversation.id, e)}>
          {isArchived ? '📂 ' + t('collaboration.menu.unarchive', 'Unarchive') : '🗂️ ' + t('collaboration.menu.archive', 'Archive Chat')}
        </button>
        <button className="menu-item" onClick={(e) => handleToggleUnread(conversation.id, e)}>
          {isUnread ? '👁️ ' + t('collaboration.menu.markRead', 'Mark as Read') : '🔔 ' + t('collaboration.menu.markUnread', 'Mark as Unread')}
        </button>
        
        <div className="menu-divider" />
        
        <div className="menu-submenu">
          <span className="submenu-title">🔇 {t('collaboration.menu.mute', 'Mute Notifications')}</span>
          <div className="submenu-options">
            <button onClick={(e) => handleMute(conversation.id, 8, e)}>8h</button>
            <button onClick={(e) => handleMute(conversation.id, 24, e)}>1d</button>
            <button onClick={(e) => handleMute(conversation.id, -1, e)}>∞</button>
            {isMuted && <button className="unmute" onClick={(e) => handleMute(conversation.id, null, e)}>Unmute</button>}
          </div>
        </div>

        <div className="menu-divider" />

        <button className="menu-item danger" onClick={(e) => handleClearChat(conversation.id, e)}>
          🧹 {t('collaboration.menu.clear', 'Clear Chat')}
        </button>
        <button className="menu-item danger" onClick={(e) => handleDeleteChat(conversation.id, e)}>
          🗑️ {t('collaboration.menu.delete', 'Delete Chat')}
        </button>
      </div>
    );
  };

  // If auth not ready or no user, show loading
  if (!currentUser) {
    return (
      <div className="collaboration-loading">
        <p>{t('collaboration.loading')}</p>
      </div>
    );
  }

  // Show landing page
  return (
    <div className={`collaboration-app ${focusMode ? 'focus-mode' : ''}`}>
      {/* Sidebar - Persistent left navigation */}
      <aside className="collaboration-sidebar-v2">
        <div className="sidebar-header-v2">
          <h2>{t('collaboration.title')}</h2>
          <div className="sidebar-tabs scrollable-tabs">
            <button
              className={`sidebar-tab ${sidebarTab === 'chats' ? 'active' : ''}`}
              onClick={() => setSidebarTab('chats')}
            >
              💬 {t('collaboration.tabs.chats', 'Chats')}
            </button>
            <button
              className={`sidebar-tab ${sidebarTab === 'groups' ? 'active' : ''}`}
              onClick={() => setSidebarTab('groups')}
            >
              👥 {t('collaboration.tabs.groups', 'Groups')}
            </button>
            <button
              className={`sidebar-tab ${sidebarTab === 'archived' ? 'active' : ''}`}
              onClick={() => setSidebarTab('archived')}
            >
              📂 {t('collaboration.conversations.archived', 'Archived')}
            </button>
            <button
              className={`sidebar-tab ${sidebarTab === 'unread' ? 'active' : ''}`}
              onClick={() => setSidebarTab('unread')}
            >
              🔔 {t('collaboration.tabs.unread', 'Unread')}
            </button>
            <button
              className={`sidebar-tab ${sidebarTab === 'favorites' ? 'active' : ''}`}
              onClick={() => setSidebarTab('favorites')}
            >
              ⭐ {t('collaboration.tabs.favorites', 'Favorites')}
            </button>
            <button
              className={`sidebar-tab ${sidebarTab === 'friends' ? 'active' : ''}`}
              onClick={() => setSidebarTab('friends')}
            >
              👤 {t('collaboration.tabs.friends', 'Friends')}
            </button>
          </div>
        </div>

        <div className="sidebar-content-v2">
          {sidebarTab !== 'friends' && sidebarTab !== 'archived' ? (
            <div className="chats-tab-content">
              {(sidebarTab === 'chats' || sidebarTab === 'groups') && (
                <div className="tab-actions">
                  <button className="create-group-btn-v2" onClick={() => setShowGroupCreate(true)}>
                    ➕ {t('collaboration.chat.createGroup', 'Create Group')}
                  </button>
                </div>
              )}

              {loading ? (
                <div className="tab-loading">{t('collaboration.loading')}</div>
              ) : conversations.length === 0 ? (
                <div className="tab-empty">{t('collaboration.conversations.empty')}</div>
              ) : (
                <div className="conversations-list-v2">
                  {sortedConversations
                    .filter(conv => {
                      if (sidebarTab === 'chats') return !hiddenConversations.has(conv.id);
                      if (sidebarTab === 'groups') return conv.type === 'group' && !hiddenConversations.has(conv.id);
                      if (sidebarTab === 'unread') {
                        return (
                          !!conv.lastMessage && 
                          conv.lastMessage.senderUid !== currentUser!.uid && 
                          !readIds.has(conv.id) && 
                          !hiddenConversations.has(conv.id)
                        );
                      }
                      if (sidebarTab === 'favorites') return favorites.has(conv.id);
                      return !hiddenConversations.has(conv.id);
                    })
                    .map((conversation) => (
                      <div
                        key={conversation.id}
                        className={`conversation-card ${activeConversationId === conversation.id ? 'active' : ''} ${pinned.has(conversation.id) ? 'is-pinned' : ''}`}
                        onClick={() => handleOpenConversation(conversation.id)}
                      >
                        <div className="card-avatar">
                          {conversation.type === 'group' ? '👥' : '👤'}
                          {favorites.has(conversation.id) && <span className="favorite-indicator">⭐</span>}
                          {pinned.has(conversation.id) && <span className="pinned-indicator">📌</span>}
                          {/* Unread indicator dot */}
                          {(!readIds.has(conversation.id) && 
                            conversation.lastMessage && 
                            conversation.lastMessage.senderUid !== currentUser!.uid) && (
                            <span className="unread-dot"></span>
                          )}
                        </div>
                        <div className="card-info">
                          <div className="card-name">
                            {conversation.type === 'group'
                              ? conversation.groupName || 'Group Chat'
                              : conversation.participantNames[conversation.participants.findIndex(uid => uid !== currentUser!.uid)] || 'User'
                            }
                            {muted.has(conversation.id) && <span className="muted-icon">🔇</span>}
                          </div>
                          {conversation.lastMessage && (
                            <div className="card-preview">
                              {conversation.lastMessage.text}
                            </div>
                          )}
                        </div>
                        <div className="card-menu-container">
                          <button
                            className="menu-trigger-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuId(activeMenuId === conversation.id ? null : conversation.id);
                            }}
                          >
                            ▼
                          </button>
                          {renderContextMenu(conversation)}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          ) : sidebarTab === 'archived' ? (
            <div className="chats-tab-content">
              {hiddenConversations.size === 0 ? (
                <div className="tab-empty">{t('collaboration.conversations.archivedEmpty', 'No archived conversations')}</div>
              ) : (
                <div className="conversations-list-v2">
                  {sortedConversations
                    .filter(conv => hiddenConversations.has(conv.id))
                    .map((conversation) => (
                      <div
                        key={conversation.id}
                        className={`conversation-card ${activeConversationId === conversation.id ? 'active' : ''}`}
                        onClick={() => handleOpenConversation(conversation.id)}
                      >
                        <div className="card-avatar">
                          {conversation.type === 'group' ? '👥' : '👤'}
                        </div>
                        <div className="card-info">
                          <div className="card-name">
                            {conversation.type === 'group'
                              ? conversation.groupName || 'Group Chat'
                              : conversation.participantNames[conversation.participants.findIndex(uid => uid !== currentUser!.uid)] || 'User'
                            }
                          </div>
                          {conversation.lastMessage && (
                            <div className="card-preview">
                              {conversation.lastMessage.text}
                            </div>
                          )}
                        </div>
                        <div className="card-menu-container">
                          <button
                            className="menu-trigger-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuId(activeMenuId === conversation.id ? null : conversation.id);
                            }}
                          >
                            ▼
                          </button>
                          {renderContextMenu(conversation)}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          ) : (
            <div className="friends-tab-content">
              <FriendSearch
                currentUid={currentUser.uid}
                onRequestSent={() => { }}
              />

              {friendRequests.length > 0 && (
                <FriendRequests
                  requests={friendRequests}
                  onRequestHandled={() => { }}
                />
              )}

              <FriendList
                friends={friends}
                currentUid={currentUser.uid}
                onStartChat={handleStartChat}
              />
            </div>
          )}
        </div>

        <div className="sidebar-footer-v2">
          {!focusMode && (
            <button className="focus-toggle-btn" onClick={() => onFocusModeChange(true)}>
              🧘 {t('learning.accessibility.distractionFree')}
            </button>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="collaboration-main-v2">
        {activeConversationId ? (
          <ChatUI
            conversationId={activeConversationId}
            currentUser={currentUser}
            onBack={handleBackToLanding}
          />
        ) : (
          <div className="collaboration-welcome">
            <div className="welcome-content">
              <div className="welcome-icon">💬</div>
              <h1>{t('collaboration.welcome.title', 'Collaboration Hub')}</h1>
              <p>{t('collaboration.welcome.subtitle', 'Select a conversation or find a friend to start chatting.')}</p>
              <button 
                className="welcome-action-btn"
                onClick={() => setSidebarTab('friends')}
              >
                Find Friends
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      {showGroupCreate && currentUser?.uid && (
        <GroupChatCreate
          currentUid={currentUser.uid}
          onGroupCreated={(conversationId) => {
            setShowGroupCreate(false);
            setActiveConversationId(conversationId);
            setSidebarTab('chats');
          }}
          onCancel={() => setShowGroupCreate(false)}
        />
      )}

      {/* Focus Mode Overlay */}
      {focusMode && (
        <button
          className="collaboration-exit-focus"
          onClick={() => onFocusModeChange(false)}
        >
          {t('learning.accessibility.exitDistraction')}
        </button>
      )}
    </div>
  );
};

export default Collaboration;
