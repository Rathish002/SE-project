/**
 * Collaboration Landing Page Component
 * Main collaboration hub with friend management and conversations
 */

import React, { useState, useEffect } from 'react';
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
  const [showHidden, setShowHidden] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<'chats' | 'groups' | 'archived' | 'unread' | 'favorites' | 'friends'>('chats');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

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
    const storageKey = `hiddenConversations_${currentUser.uid}`;
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

    const storageKey = `favoriteConversations_${currentUser.uid}`;
    localStorage.setItem(storageKey, JSON.stringify(Array.from(newFavorites)));
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
                  {conversations
                    .filter(conv => {
                      if (sidebarTab === 'chats') return !hiddenConversations.has(conv.id);
                      if (sidebarTab === 'groups') return conv.type === 'group' && !hiddenConversations.has(conv.id);
                      if (sidebarTab === 'unread') {
                        return (
                          !!conv.lastMessage && 
                          conv.lastMessage.senderUid !== currentUser.uid && 
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
                        className={`conversation-card ${activeConversationId === conversation.id ? 'active' : ''}`}
                        onClick={() => handleOpenConversation(conversation.id)}
                      >
                        <div className="card-avatar">
                          {conversation.type === 'group' ? '👥' : '👤'}
                          {favorites.has(conversation.id) && <span className="favorite-indicator">⭐</span>}
                          {/* Unread indicator dot */}
                          {(!readIds.has(conversation.id) && 
                            conversation.lastMessage && 
                            conversation.lastMessage.senderUid !== currentUser.uid) && (
                            <span className="unread-dot"></span>
                          )}
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
                        <div className="card-actions">
                          <button
                            className={`favorite-btn ${favorites.has(conversation.id) ? 'active' : ''}`}
                            onClick={(e) => handleToggleFavorite(conversation.id, e)}
                            title={favorites.has(conversation.id) ? 'Remove from favorites' : 'Mark as favorite'}
                          >
                            {favorites.has(conversation.id) ? '⭐' : '☆'}
                          </button>
                          <button
                            className="archive-btn"
                            onClick={(e) => handleHideConversation(conversation.id, e)}
                            title="Archive"
                          >
                            🗂️
                          </button>
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
                  {conversations
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
                        <div className="card-actions">
                          <button
                            className="archive-btn"
                            onClick={(e) => handleUnhideConversation(conversation.id, e)}
                            title="Unarchive"
                          >
                            ↩️
                          </button>
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
