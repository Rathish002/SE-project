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
}

const Collaboration: React.FC<CollaborationProps> = ({ currentUser, focusMode, onFocusModeChange }) => {
  const { t } = useTranslation();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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
    const conversation = conversations.find(c => c.id === conversationId);
    saveActivity({
      lastConversationId: conversationId,
      lastConversationName: conversation?.participantNames.join(', ') || 'Chat',
    });
  };

  const handleBackToLanding = () => {
    setActiveConversationId(null);
  };

  // If auth not ready or no user, show loading
  if (!currentUser) {
    return (
      <div className="collaboration-loading">
        <p>{t('collaboration.loading')}</p>
      </div>
    );
  }

  // Show chat UI if conversation is active
  if (activeConversationId) {
    return (
      <ChatUI
        conversationId={activeConversationId}
        currentUser={currentUser}
        onBack={handleBackToLanding}
      />
    );
  }

  // Show landing page
  return (
    <div className="collaboration-landing">
      <div className="collaboration-header">
        <h1>{t('collaboration.title')}</h1>
        {!focusMode && (
          <label className="collaboration-focus-toggle">
            <input
              type="checkbox"
              checked={focusMode}
              onChange={(e) => onFocusModeChange(e.target.checked)}
              aria-label={t('learning.accessibility.distractionFree')}
            />
            {t('learning.accessibility.distractionFree')}
          </label>
        )}
      </div>

      {loading ? (
        <div className="collaboration-loading">
          <p>{t('collaboration.loading')}</p>
        </div>
      ) : (
        <div className="collaboration-content-grid">
          <div className="collaboration-main">
            <FriendSearch
              currentUid={currentUser.uid}
              onRequestSent={() => {}}
            />

            {friendRequests.length > 0 && (
              <FriendRequests
                requests={friendRequests}
                onRequestHandled={() => {}}
              />
            )}

            <FriendList
              friends={friends}
              onStartChat={handleStartChat}
            />
          </div>

          <div className="collaboration-sidebar">
            <h3 className="collaboration-sidebar-title">{t('collaboration.conversations.title')}</h3>
            {conversations.length === 0 ? (
              <div className="collaboration-empty">
                <p>{t('collaboration.conversations.empty')}</p>
              </div>
            ) : (
              <div className="collaboration-conversations">
                {conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className="collaboration-conversation-item"
                    onClick={() => handleOpenConversation(conversation.id)}
                  >
                    <div className="conversation-item-header">
                      <span className="conversation-item-name">
                        {conversation.type === 'group'
                          ? conversation.participantNames.join(', ')
                          : conversation.participantNames.find(name => name !== currentUser.displayName) || 'User'
                        }
                      </span>
                    </div>
                    {conversation.lastMessage && (
                      <div className="conversation-item-preview">
                        <span className="conversation-item-sender">
                          {conversation.lastMessage.senderName}:
                        </span>
                        <span className="conversation-item-text">
                          {conversation.lastMessage.text}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {focusMode && (
        <button
          className="collaboration-exit-focus"
          onClick={() => onFocusModeChange(false)}
          aria-label={t('learning.accessibility.exitDistraction')}
        >
          {t('learning.accessibility.exitDistraction')}
        </button>
      )}
    </div>
  );
};

export default Collaboration;
