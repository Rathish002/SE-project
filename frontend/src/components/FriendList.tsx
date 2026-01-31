/**
 * Friend List Component
 * Displays friends with presence status
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import type { Friend } from '../services/friendService';
import './FriendList.css';

interface FriendListProps {
  friends: Friend[];
  onStartChat: (friendUid: string) => void;
  onStartGroup?: (friendUids: string[]) => void;
}

const FriendList: React.FC<FriendListProps> = ({ friends, onStartChat, onStartGroup }) => {
  const { t } = useTranslation();

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
                  {friend.online ? t('collaboration.friends.online') : t('collaboration.friends.offline')}
                </span>
              </div>
              <span className="friend-email">{friend.email}</span>
            </div>
            <div className="friend-actions">
              <button
                className="friend-action-button"
                onClick={() => onStartChat(friend.uid)}
                aria-label={t('collaboration.friends.startChat')}
              >
                {t('collaboration.friends.startChat')}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FriendList;
