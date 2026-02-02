/**
 * Friend Requests Component
 * Displays and handles incoming friend requests
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { acceptFriendRequest, rejectFriendRequest, validateFriendRequest, type FriendRequest } from '../services/friendService';
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
  const [validRequests, setValidRequests] = useState<Set<string>>(new Set());

  // Validate and load profiles for requests
  useEffect(() => {
    const loadProfilesAndValidate = async () => {
      const profiles = new Map();
      const valid = new Set<string>();
      
      for (const request of requests) {
        // Validate request
        const validation = await validateFriendRequest(request.id);
        if (validation.valid) {
          valid.add(request.id);
          
          // Load profile
          const profile = await getUserProfile(request.fromUid);
          if (profile) {
            profiles.set(request.id, { name: profile.name, email: profile.email });
          }
        }
      }
      
      setValidRequests(valid);
      setRequestProfiles(profiles);
    };
    loadProfilesAndValidate();
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

  // Filter to only show valid requests
  const displayRequests = requests.filter(req => validRequests.has(req.id));

  if (displayRequests.length === 0) {
    return null;
  }

  return (
    <div className="friend-requests">
      <h3 className="friend-requests-title">{t('collaboration.requests.title')}</h3>
      <div className="friend-requests-list">
        {displayRequests.map((request) => {
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
