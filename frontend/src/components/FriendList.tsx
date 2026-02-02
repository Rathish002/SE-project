/**
 * Friend List Component
 * Displays friends with presence status
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Friend } from '../services/friendService';
import { removeFriend } from '../services/friendService';
import { formatLastActive } from '../utils/timeUtils';
import { blockUser } from '../services/blockService';
import './FriendList.css';

interface FriendListProps {
  friends: Friend[];
  currentUid: string;
  onStartChat: (friendUid: string) => void;
  onStartGroup?: (friendUids: string[]) => void;
}

const FriendList: React.FC<FriendListProps> = ({ friends, currentUid, onStartChat, onStartGroup }) => {
  const { t } = useTranslation();
  const [blockConfirm, setBlockConfirm] = useState<string | null>(null);
  const [unfriendConfirm, setUnfriendConfirm] = useState<string | null>(null);
  const [blocking, setBlocking] = useState(false);
  const [unfriending, setUnfriending] = useState(false);

  const handleBlock = async (friendUid: string) => {
    if (blockConfirm !== friendUid) {
      setBlockConfirm(friendUid);
      // Auto-cancel after 5 seconds
      setTimeout(() => setBlockConfirm(null), 5000);
      return;
    }
    
    try {
      setBlocking(true);
      await blockUser(currentUid, friendUid);
      setBlockConfirm(null);
    } catch (error) {
      console.error('Error blocking user:', error);
      alert('Failed to block user');
    } finally {
      setBlocking(false);
    }
  };

  const handleUnfriend = async (friendUid: string) => {
    if (unfriendConfirm !== friendUid) {
      setUnfriendConfirm(friendUid);
      // Auto-cancel after 5 seconds
      setTimeout(() => setUnfriendConfirm(null), 5000);
      return;
    }
    
    try {
      setUnfriending(true);
      await removeFriend(currentUid, friendUid);
      setUnfriendConfirm(null);
    } catch (error) {
      console.error('Error removing friend:', error);
      alert('Failed to remove friend');
    } finally {
      setUnfriending(false);
    }
  };

  if (friends.length === 0) {
    return (
      <div className="friend-list-empty">
        <p>{t('collaboration.friends.empty')}</p>
      </div>
    );
  }

  return (
    <div className="friend-list">
      <h3 className="friend-list-title">{t('collaboration.friends.title')}</h3>
      <div className="friend-list-items">
        {friends.map((friend) => (
          <div key={friend.uid} className="friend-item">
            <div className="friend-info">
              <div className="friend-name-row">
                <span className="friend-name">{friend.name}</span>
                <span className={`friend-status ${friend.online ? 'online' : 'offline'}`}>
                  {friend.online 
                    ? t('collaboration.friends.online')
                    : `Last seen ${formatLastActive(friend.lastActive)}`
                  }
                </span>
              </div>
              <span className="friend-email">{friend.email}</span>
            </div>
            <div className="friend-actions">
              <button
                className="friend-action-button"
                onClick={() => onStartChat(friend.uid)}
                aria-label={t('collaboration.friends.startChat')}
                disabled={blocking || unfriending}
              >
                {t('collaboration.friends.startChat')}
              </button>
              <button
                className="friend-action-button friend-unfriend-button"
                onClick={() => handleUnfriend(friend.uid)}
                disabled={blocking || unfriending}
                title="Remove friend"
              >
                {unfriendConfirm === friend.uid ? 'Confirm?' : 'Unfriend'}
              </button>
              <button
                className="friend-action-button friend-block-button"
                onClick={() => handleBlock(friend.uid)}
                disabled={blocking || unfriending}
                title="Block this user"
              >
                {blockConfirm === friend.uid ? 'Confirm Block?' : 'Block'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FriendList;
