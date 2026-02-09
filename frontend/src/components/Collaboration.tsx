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
import './Collaboration.css';

interface CollaborationProps {
  currentUser: User | null;
  focusMode: boolean;
  onFocusModeChange: (enabled: boolean) => void;
}

const Collaboration: React.FC<CollaborationProps> = ({
  currentUser,
  focusMode,
  onFocusModeChange,
}) => {
  const { t } = useTranslation();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showGroupCreate, setShowGroupCreate] = useState(false);

  /* ================= FULLSCREEN ================= */

  const enterFullscreen = () => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) elem.requestFullscreen().catch(() => {});
  };

  const exitFullscreen = () => {
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) onFocusModeChange(false);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [onFocusModeChange]);

  /* ================= DATA ================= */

  useEffect(() => {
    if (!currentUser?.uid) return;
    return subscribeToFriends(currentUser.uid, (f) => {
      setFriends(f);
      setLoading(false);
    });
  }, [currentUser?.uid]);

  useEffect(() => {
    if (!currentUser?.uid) return;
    return subscribeToFriendRequests(currentUser.uid, setFriendRequests);
  }, [currentUser?.uid]);

  useEffect(() => {
    if (!currentUser?.uid) return;
    return subscribeToConversations(currentUser.uid, setConversations);
  }, [currentUser?.uid]);

  /* ================= CHAT ================= */

  const handleStartChat = async (friendUid: string) => {
    if (!currentUser?.uid) return;
    const id = await getOrCreateDirectConversation(currentUser.uid, friendUid);
    setActiveConversationId(id);
  };

  if (!currentUser) {
    return <div className="collaboration-loading"><p>{t('collaboration.loading')}</p></div>;
  }

  if (activeConversationId) {
    return (
      <ChatUI
        conversationId={activeConversationId}
        currentUser={currentUser}
        onBack={() => setActiveConversationId(null)}
      />
    );
  }

  if (showGroupCreate && currentUser.uid) {
    return (
      <GroupChatCreate
        currentUid={currentUser.uid}
        onGroupCreated={(id) => {
          setShowGroupCreate(false);
          setActiveConversationId(id);
        }}
        onCancel={() => setShowGroupCreate(false)}
      />
    );
  }

  /* ================= MAIN ================= */

  return (
    <div className="collaboration-landing">

      {/* HEADER */}
      <div className="collaboration-header">
        <h1>{t('collaboration.title')}</h1>

        <div className="header-controls">

          {/* Focus Toggle */}
          {!focusMode && (
            <label className="collaboration-focus-toggle">
              <input
                type="checkbox"
                checked={focusMode}
                onChange={(e) => {
                  const enabled = e.target.checked;
                  onFocusModeChange(enabled);
                  enabled ? enterFullscreen() : exitFullscreen();
                }}
              />
              {t('learning.accessibility.distractionFree')}
            </label>
          )}

          {/* Create Group */}
          {friends.length > 0 && !focusMode && (
            <button
              className="create-group-btn"
              onClick={() => setShowGroupCreate(true)}
            >
              ➕ Create Group
            </button>
          )}

          {/* EXIT FOCUS beside title */}
          {focusMode && (
            <button
              className="collaboration-exit-focus"
              onClick={() => {
                onFocusModeChange(false);
                exitFullscreen();
              }}
            >
              Exit Focus
            </button>
          )}

        </div>
      </div>

      {/* CONTENT */}
      {loading ? (
        <div className="collaboration-loading">
          <p>{t('collaboration.loading')}</p>
        </div>
      ) : (
        <div className="collaboration-content-grid">

          <div className="collaboration-main">
            <FriendSearch currentUid={currentUser.uid} onRequestSent={() => {}} />
            {friendRequests.length > 0 && (
              <FriendRequests requests={friendRequests} onRequestHandled={() => {}} />
            )}
            <FriendList
              friends={friends}
              currentUid={currentUser.uid}
              onStartChat={handleStartChat}
            />
          </div>

          <div className="collaboration-sidebar">
            {conversations.map((c) => (
              <div
                key={c.id}
                className="collaboration-conversation-item"
                onClick={() => setActiveConversationId(c.id)}
              >
                {c.type === 'group'
                  ? c.groupName || 'Group Chat'
                  : c.participantNames.join(', ')}
              </div>
            ))}
          </div>

        </div>
      )}
    </div>
  );
};

export default Collaboration;
