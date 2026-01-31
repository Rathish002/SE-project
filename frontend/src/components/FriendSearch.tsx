/**
 * Friend Search Component
 * Search users by email and send friend requests
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { searchUsersByEmail, sendFriendRequest } from '../services/friendService';
import type { UserProfile } from '../services/userService';
import './FriendSearch.css';

interface FriendSearchProps {
  currentUid?: string | null;
  onRequestSent?: () => void;
}

const FriendSearch: React.FC<FriendSearchProps> = ({ currentUid, onRequestSent }) => {
  const { t } = useTranslation();
  const [searchEmail, setSearchEmail] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<UserProfile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!searchEmail.trim()) {
      setError(t('collaboration.search.empty'));
      return;
    }

    setSearching(true);
    setError(null);
    setResults([]);

    try {
      if (!currentUid) {
        setError(t('collaboration.search.authMissing'));
        return;
      }
      const found = await searchUsersByEmail(searchEmail.trim(), currentUid);
      setResults(found);
      if (found.length === 0) {
        setError(t('collaboration.search.noResults'));
      }
    } catch (err: any) {
      setError(err.message || t('collaboration.search.error'));
    } finally {
      setSearching(false);
    }
  };

  const handleSendRequest = async (toUid: string) => {
    setSending(toUid);
    setError(null);

    try {
      if (!currentUid) throw new Error('Auth not ready');
      await sendFriendRequest(currentUid, toUid);
      setResults([]);
      setSearchEmail('');
      if (onRequestSent) {
        onRequestSent();
      }
    } catch (err: any) {
      setError(err.message || t('collaboration.search.requestError'));
    } finally {
      setSending(null);
    }
  };

  return (
    <div className="friend-search">
      <h3 className="friend-search-title">{t('collaboration.search.title')}</h3>
      <div className="friend-search-form">
        <input
          type="email"
          className="friend-search-input"
          placeholder={t('collaboration.search.placeholder')}
          value={searchEmail}
          onChange={(e) => setSearchEmail(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          disabled={searching}
        />
        <button
          className="friend-search-button"
          onClick={handleSearch}
          disabled={searching || !searchEmail.trim()}
        >
          {searching ? t('collaboration.search.searching') : t('collaboration.search.search')}
        </button>
      </div>

      {error && (
        <div className="friend-search-error">
          {error}
        </div>
      )}

      {results.length > 0 && (
        <div className="friend-search-results">
          {results.map((user) => (
            <div key={user.uid} className="friend-search-result-item">
              <div className="friend-search-result-info">
                <span className="friend-search-result-name">{user.name}</span>
                <span className="friend-search-result-email">{user.email}</span>
              </div>
              <button
                className="friend-search-send-button"
                onClick={() => handleSendRequest(user.uid)}
                disabled={sending === user.uid}
              >
                {sending === user.uid ? t('collaboration.search.sending') : t('collaboration.search.sendRequest')}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FriendSearch;
