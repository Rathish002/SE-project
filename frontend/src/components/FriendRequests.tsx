/**
 * Friend Requests Component
 * Displays and handles incoming friend requests
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { acceptFriendRequest, rejectFriendRequest, type FriendRequest } from '../services/friendService';
import { getUserProfile } from '../services/userService';
import './FriendRequests.css';

interface FriendRequestsProps {
  requests: FriendRequest[];
  onRequestHandled: () => void;
}

const FriendRequests: React.FC<FriendRequestsProps> = ({ requests, onRequestHandled }) => {
  const { t } = useTranslation();
  const [handling, setHandling] = useState<string | null>(null);
  const [requestProfiles, setRequestProfiles] = useState<Map<string, { name: string; email: string }>>(new Map());

  // Load profiles for requests
  useEffect(() => {
    const loadProfiles = async () => {
      const profiles = new Map();
      for (const request of requests) {
        const profile = await getUserProfile(request.fromUid);
        if (profile) {
          profiles.set(request.id, { name: profile.name, email: profile.email });
        }
      }
      setRequestProfiles(profiles);
    };
    loadProfiles();
  }, [requests]);

  const handleAccept = async (requestId: string, fromUid: string, toUid: string) => {
    setHandling(requestId);
    try {
      await acceptFriendRequest(requestId, fromUid, toUid);
      onRequestHandled();
    } catch (error: any) {
      console.error('Error accepting request:', error);
      alert(t('collaboration.requests.acceptError'));
    } finally {
      setHandling(null);
    }
  };

  const handleReject = async (requestId: string) => {
    setHandling(requestId);
    try {
      await rejectFriendRequest(requestId);
      onRequestHandled();
    } catch (error: any) {
      console.error('Error rejecting request:', error);
      alert(t('collaboration.requests.rejectError'));
    } finally {
      setHandling(null);
    }
  };

  if (requests.length === 0) {
    return null;
  }

  return (
    <div className="friend-requests">
      <h3 className="friend-requests-title">{t('collaboration.requests.title')}</h3>
      <div className="friend-requests-list">
        {requests.map((request) => {
          const profile = requestProfiles.get(request.id);
          return (
            <div key={request.id} className="friend-request-item">
              <div className="friend-request-info">
                <span className="friend-request-name">{profile?.name || 'User'}</span>
                <span className="friend-request-email">{profile?.email || ''}</span>
              </div>
              <div className="friend-request-actions">
                <button
                  className="friend-request-accept"
                  onClick={() => handleAccept(request.id, request.fromUid, request.toUid)}
                  disabled={handling === request.id}
                >
                  {t('collaboration.requests.accept')}
                </button>
                <button
                  className="friend-request-reject"
                  onClick={() => handleReject(request.id)}
                  disabled={handling === request.id}
                >
                  {t('collaboration.requests.reject')}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FriendRequests;
